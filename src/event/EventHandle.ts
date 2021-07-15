import * as normalizeWheel from 'normalize-wheel';
import Render from '../render';
import CanvasPainter from '../painter/CanvasPainter';
import Element from '../shapes/Element';
import { valueToRgb } from '../color';

import {
  SyntheticEvent,
  SyntheticMouseEvent,
  SyntheticTouchEvent,
  SyntheticDragEvent,
  SyntheticWheelEvent,
} from './index';
import { SyntheticDragEventParams } from './SyntheticDragEvent';
import { SyntheticMouseEventParams } from './SyntheticMouseEvent';
import { SyntheticWheelEventParams } from './SyntheticWheelEvent';
import { SyntheticTouchEventParams, SyntheticTouch } from './SyntheticTouchEvent';
import { getTouchOffsetPosition } from '../utils/touch-offset';
import { inBBox } from '../utils/bbox';
import * as lodash from '../utils/lodash';

function toTouchArray(touches: TouchList): Touch[] {
  const len = touches.length;
  const out: Touch[] = [];
  for (let i = 0; i < len; i++) {
    out.push(touches[i]);
  }
  return out;
}

interface DispatchTouch {
  identifier: number;
  x: number;
  y: number;
}
export interface DispatchTouchParam {
  touches: DispatchTouch[];
  changedTouches: DispatchTouch[];
}
const AUTO_DETECT_THROTTLE = 500;

export default class EventHandle {
  public render: Render;

  private _draggingTarget: Element | null = null;

  private _prevMouseTarget: Element | null = null;

  private _prevMousePosition: { x: number; y: number } | null = null;

  private _dragStartMouse: { x: number; y: number } | null = null;

  private _dragStartTouchId: number;

  private _eventOnly: boolean;

  private _PixelPainter: CanvasPainter;

  private _lastMouseSyntheticTimestamp: number;

  private _touchStartInfo: SyntheticTouchEvent;

  private _cancelClick: boolean = true;

  public constructor(render: Render, eventOnly: boolean = false) {
    this.render = render;
    this._PixelPainter = new CanvasPainter(render, true);
    this._eventOnly = eventOnly;
    this._initEvents();
    this._onRenderDirty = lodash.throttle(this._onRenderDirty, AUTO_DETECT_THROTTLE);
  }

  public onFrame() {
    if (
      this.render.needUpdate() &&
      this._prevMousePosition &&
      Date.now() - this._lastMouseSyntheticTimestamp > AUTO_DETECT_THROTTLE
    ) {
      this._onRenderDirty();
    }
  }

  public dispatch<T extends string>(
    type: T,
    param: T extends 'touchstart' | 'touchmove' | 'touchend'
      ? DispatchTouchParam
      : { x: number; y: number; detail?: any },
  ) {
    if (type === 'touchstart' || type === 'touchmove' || type === 'touchend') {
      this._syntheticTouchEvent(
        {
          type,
          ...param,
        } as any,
        false,
      );
    } else {
      this._syntheticMouseEvent(
        {
          type,
          ...param,
        } as any,
        false,
      );
    }
  }

  public pickTarget(x: number, y: number): Element {
    // console.time('pick');
    const pixelPainter = this._PixelPainter;
    const ignoreInvisibleNodes = true;
    const ignoreMute = true; // pointerevent none
    let target: Element;
    // 初步过滤掉不显示和不触发事件的元素
    let pickNodes = this._getHandleGroup()
      .getAllLeafNodes([], ignoreInvisibleNodes, ignoreMute)
      .reverse();

    this._getHandleGroup().resetPickRGB();

    // 过渡掉不在包围盒中的
    pickNodes = pickNodes.filter(
      node => node.attr.display && inBBox(node.getBoundingClientRect(), x, y),
    );

    let geometryPickIndex: number = -1;
    let gpuPickIndex: number = -1;
    let inShape: boolean;
    let inClip: boolean;
    let node: Element;
    for (let i = 0; i < pickNodes.length; i++) {
      node = pickNodes[i];
      if (node.pickByGPU()) {
        continue;
      }
      inShape = node.isInShape(x, y);
      inClip = node.isInClip(x, y);
      if (inShape && inClip) {
        geometryPickIndex = i;
        break;
      }
    }

    const gpuPickNodes = pickNodes.filter(node => node.pickByGPU());
    gpuPickNodes.forEach((item, index) => {
      // 颜色空间大约有40W个,基本够用.
      item.pickRGB = valueToRgb(index + 1);
    });

    // console.log('gpu pick size ', gpuPickNodes.length);

    if (gpuPickNodes.length > 0 && pixelPainter.getContext().getImageData) {
      pixelPainter.paintAt(x, y);
      // todo 考虑小程序getImageData兼容
      // const prevImageData = pixelPainter.getImageData(x, y);
      const imageData = pixelPainter.getImageData(0, 0, 1, 1);
      if (imageData) {
        const pickValue = imageData.data;
        const r0 = pickValue[0];
        const g0 = pickValue[1];
        const b0 = pickValue[2];

        for (let i = 0; i < pickNodes.length; i++) {
          const node = pickNodes[i];
          if (!node.pickByGPU()) {
            continue;
          }
          const [r, g, b] = node.pickRGB;
          const gap = Math.abs(r - r0) + Math.abs(g - g0) + Math.abs(b - b0);
          if (gap < 3) {
            gpuPickIndex = i;
            break;
          }
        }
      }
    }

    if (geometryPickIndex >= 0 || gpuPickIndex >= 0) {
      let pickIndex: number;
      if (geometryPickIndex === -1 || gpuPickIndex === -1) {
        pickIndex = Math.max(geometryPickIndex, gpuPickIndex);
      } else {
        pickIndex = Math.min(geometryPickIndex, gpuPickIndex);
      }
      target = pickNodes[pickIndex];
    }

    // console.timeEnd('pick');
    return target || this._getHandleGroup();
  }

  public dispose() {
    if (this.render.isBrowser()) {
      this._detachEvents();
    }
    this._PixelPainter.dispose();
  }

  // public dispatchEvent(event: string, detail: EventDetail) {
  //   // todo 用户自定义事件
  // }

  private _syntheticMouseEvent = (nativeEvent: MouseEvent, isNative: boolean = true) => {
    // todo统一mousewheel事件
    const { x, y } = isNative ? this._getMousePosition(nativeEvent) : nativeEvent;
    const target = this.pickTarget(x, y);
    const prevMouseTarget = this._prevMouseTarget;
    this._lastMouseSyntheticTimestamp = Date.now();
    const mouseEventParam: SyntheticMouseEventParams = {
      x,
      y,
      bubbles: true,
      original: nativeEvent,
      timeStamp: nativeEvent.timeStamp,
    };
    let event: SyntheticMouseEvent;
    if (nativeEvent.type === 'wheel') {
      const { deltaMode, deltaX, deltaY, deltaZ } = nativeEvent as WheelEvent;
      const wheelEventParam: SyntheticWheelEventParams = {
        ...mouseEventParam,
        deltaMode,
        deltaX,
        deltaY,
        deltaZ,
        normalizeWheel: normalizeWheel(nativeEvent as WheelEvent),
      };
      event = new SyntheticWheelEvent(nativeEvent.type, wheelEventParam);
    } else {
      event = new SyntheticMouseEvent(nativeEvent.type, mouseEventParam);
    }
    this._dispatchSyntheticEvent(event, target);

    if (event.type === 'mousedown' || event.type === 'mousemove') {
      // todo 父元素也可以拖动
      if (event.type === 'mousedown' && nativeEvent.button !== 2) {
        const parentNodes = target.getAncestorNodes(true);
        for (let i = 0; i < parentNodes.length; i++) {
          if (parentNodes[i].attr.draggable) {
            this._draggingTarget = parentNodes[i];
            this._dragStartMouse = { x, y };
            nativeEvent.preventDefault && nativeEvent.preventDefault();
            break;
          }
        }
      }
      if (this._draggingTarget) {
        const eventMap = {
          mousedown: 'dragstart',
          mousemove: 'drag',
        };
        const eventType = eventMap[event.type];
        const dragParam = {
          ...mouseEventParam,
          ...this._getDragParam(mouseEventParam),
        };
        const onDragEvent = new SyntheticDragEvent(eventType, dragParam);
        this._dispatchSyntheticEvent(onDragEvent, this._draggingTarget);
        if (prevMouseTarget !== target) {
          const onDragLeaveEvent = new SyntheticDragEvent('dragleave', dragParam);
          const onDragOverEvent = new SyntheticDragEvent('dragover', dragParam);
          this._dispatchSyntheticEvent(onDragLeaveEvent, prevMouseTarget);
          this._dispatchSyntheticEvent(onDragOverEvent, target);
        }
      }
    }

    if (
      event.type === 'mouseup' &&
      this._draggingTarget &&
      !this._draggingTarget.contains(target)
    ) {
      const dragParam = {
        ...mouseEventParam,
        bubbles: true,
        ...this._getDragParam(mouseEventParam),
      };
      const dropEvent = new SyntheticDragEvent('drop', dragParam);
      this._dispatchSyntheticEvent(dropEvent, target);
    }

    if (event.type === 'mousemove' || event.type === 'wheel' || event.type === '_onFrame') {
      if (this.render.isBrowser() && !this._eventOnly) {
        const cursor = this._draggingTarget
          ? this._draggingTarget.getExtendAttr('cursor')
          : target.getExtendAttr('cursor');
        this.render.getDom().style.cursor = cursor;
      }
      if (prevMouseTarget !== target) {
        this._synthetickOverOutEvent(prevMouseTarget, target, mouseEventParam);
      }
    }

    this._prevMousePosition = { x, y };
    this._prevMouseTarget = target;
  };

  private _syntheticTouchEvent = (nativeEvent: TouchEvent, isNative: boolean = true) => {
    const { touches, changedTouches } = nativeEvent;
    const prevMouseTarget = this._prevMouseTarget;
    this._lastMouseSyntheticTimestamp = Date.now();
    let allTouches = [...toTouchArray(touches), ...toTouchArray(changedTouches)];
    allTouches = lodash.uniq(allTouches) as Touch[];
    const touchesList: SyntheticTouch[] = allTouches.map(touch => {
      const { x, y } = isNative ? this._getMousePosition(touch) : (touch as any);
      const target = this.pickTarget(x, y);
      return {
        identifier: touch.identifier,
        x,
        y,
        target,
      };
    });
    const synthetichTouches: SyntheticTouch[] = toTouchArray(touches).map((touch: Touch) => {
      const index = allTouches.indexOf(touch);
      return touchesList[index];
    });
    const synthetichChangedTouches: SyntheticTouch[] = toTouchArray(changedTouches).map(touch => {
      const index = allTouches.indexOf(touch);
      return touchesList[index];
    });

    const touchEventParam: SyntheticTouchEventParams = {
      touches: synthetichTouches,
      changedTouches: synthetichChangedTouches,
      original: nativeEvent,
      bubbles: true,
      x: synthetichChangedTouches[0].x,
      y: synthetichChangedTouches[0].y,
      timeStamp: Date.now(),
    };

    const event = new SyntheticTouchEvent(nativeEvent.type, touchEventParam);

    // todo 根节点只被冒泡触发一次
    touchEventParam.changedTouches.forEach(touch =>
      this._dispatchSyntheticEvent(event, touch.target),
    );

    const dragEventParam: SyntheticDragEventParams = {
      startX: null,
      startY: null,
      offsetX: null,
      offsetY: null,
      x: null,
      y: null,
      dx: null,
      dy: null,
      bubbles: true,
      original: nativeEvent,
      timeStamp: nativeEvent.timeStamp || Date.now(),
    };
    let dragStartTouchId: number = this._dragStartTouchId;
    if (nativeEvent.type === 'touchstart') {
      if (this.render.simulateClickEvent) {
        this._touchStartInfo = event;
        this._cancelClick = false;
      }
      // 暂只支持单个目标拖动
      let dragStartTarget: Element;
      synthetichChangedTouches.forEach(touch => {
        const { x, y, target } = touch;
        const parentNodes = target.getAncestorNodes(true);
        for (let i = 0; i < parentNodes.length; i++) {
          if (parentNodes[i].attr.draggable) {
            dragStartTarget = this._draggingTarget = parentNodes[i];
            this._dragStartMouse = { x, y };
            dragStartTouchId = this._dragStartTouchId = touch.identifier;
            dragStartTarget = touch.target;
            break;
          }
        }
      });

      if (dragStartTarget) {
        const dragStartEvent = new SyntheticDragEvent('dragstart', {
          ...dragEventParam,
          ...this._dragStartMouse,
          ...this._getDragParam(this._findTouch(touchesList, dragStartTouchId)),
        } as any);
        this._dispatchSyntheticEvent(dragStartEvent, dragStartTarget);
      }
    }

    if (nativeEvent.type === 'touchmove') {
      if (this.render.simulateClickEvent && this._touchStartInfo) {
        const {x: prevX, y: prevY} = this._touchStartInfo;
        const dx = Math.abs(event.x - prevX);
        const dy = Math.abs(event.y - prevY);
        const touchBoundary = 10;
        if (dx > touchBoundary || dy > touchBoundary) {
          this._cancelClick = true;
        }
      }
      const touch = this._findTouch(touchesList, dragStartTouchId);
      if (this._draggingTarget && touch) {
        if (this._getHandleGroup() === this.render.getRoot()) {
          nativeEvent.preventDefault && nativeEvent.preventDefault();
        }
        const dragParam = {
          ...dragEventParam,
          x: touch.x,
          y: touch.y,
          ...this._getDragParam(this._findTouch(touchesList, dragStartTouchId)),
        };
        const onDragEvent = new SyntheticDragEvent('drag', dragParam);
        this._dispatchSyntheticEvent(onDragEvent, this._draggingTarget);
      }
      if (touch) {
        this._prevMousePosition = { x: touch.x, y: touch.y };
      }
    }

    if (nativeEvent.type === 'touchend' || nativeEvent.type === 'touchcancel') {
      if (this.render.simulateClickEvent && this._touchStartInfo) {
        if (!this._cancelClick && (event.timeStamp - this._touchStartInfo.timeStamp) < 300) {
          const clickEvent = new SyntheticMouseEvent('click', {
            x: event.x,
            y: event.y,
            original: {x: event.x, y: event.y},
            bubbles: true,
            timeStamp: event.timeStamp,
          });
          this._dispatchSyntheticEvent(clickEvent, event.changedTouches[0].target);
        }
        this._cancelClick = false;
        this._touchStartInfo = null;
      }
      const inTouch = !!this._findTouch(synthetichTouches, dragStartTouchId);
      const touch = this._findTouch(synthetichChangedTouches, dragStartTouchId);
      if (this._draggingTarget && !inTouch && touch) {
        const dragParam = {
          ...dragEventParam,
          x: touch.x,
          y: touch.y,
          ...this._getDragParam(touch),
        };
        const onDragEvent = new SyntheticDragEvent('dragend', dragParam);
        this._dispatchSyntheticEvent(onDragEvent, this._draggingTarget);
        this._draggingTarget = null;
        this._dragStartTouchId = null;
        this._dragStartMouse = null;
        this._prevMousePosition = null;
      }
    }

    // 合成mouseover mouseout
    if (changedTouches.length) {
      const target = synthetichChangedTouches[0].target;
      if (target !== prevMouseTarget) {
        const mouseEventParam: SyntheticMouseEventParams = {
          x: synthetichChangedTouches[0].x,
          y: synthetichChangedTouches[0].y,
          bubbles: true,
          original: nativeEvent,
          timeStamp: nativeEvent.timeStamp,
        };
        this._synthetickOverOutEvent(prevMouseTarget, target, mouseEventParam);
      }
      this._prevMouseTarget = target;
    } else {
      this._prevMouseTarget = null;
    }
  };

  private _handleMouseLeave = (nativeEvent: WheelEvent) => {
    // todo
    const { x, y } = this._getMousePosition(nativeEvent);
    const target = this._prevMouseTarget || this._getHandleGroup();
    const eventParam = {
      x,
      y,
      bubbles: nativeEvent.bubbles,
      original: nativeEvent,
      timeStamp: nativeEvent.timeStamp,
    };
    const mouseoutEvent = new SyntheticMouseEvent('mouseout', {
      ...eventParam,
      bubbles: true,
    });
    this._prevMousePosition = null;
    this._prevMouseTarget = null;
    this._dispatchSyntheticEvent(mouseoutEvent, target);
    const parentNodes = target.getAncestorNodes(true);
    parentNodes.forEach(node => {
      const mouseLeaveEvent: SyntheticMouseEvent = new SyntheticMouseEvent(
        'mouseleave',
        eventParam,
      );
      this._dispatchSyntheticEvent(mouseLeaveEvent, node);
    });
  };

  private _handleMouseEnter = (nativeEvent: WheelEvent) => {
    // todo
    const { x, y } = this._getMousePosition(nativeEvent);
    const target = this.pickTarget(x, y);
    if (this.render.isBrowser() && !this._eventOnly) {
      const cursor = target.getExtendAttr('cursor');
      this.render.getDom().style.cursor = cursor;
    }
    const eventParam = {
      x,
      y,
      bubbles: nativeEvent.bubbles,
      original: nativeEvent,
      timeStamp: nativeEvent.timeStamp,
    };
    const mouseoverEvent = new SyntheticMouseEvent('mouseover', {
      ...eventParam,
      bubbles: true,
    });
    this._dispatchSyntheticEvent(mouseoverEvent, target);
    // 触发当前对象的mouseover, mouseenter事件
    const parentNodes = target.getAncestorNodes(true);
    parentNodes.forEach(node => {
      const mouseEnterEvent = new SyntheticMouseEvent('mouseenter', {
        ...eventParam,
        bubbles: true,
      });
      this._dispatchSyntheticEvent(mouseEnterEvent, node);
    });
    this._prevMousePosition = { x, y };
    this._prevMouseTarget = target;
  };

  private _handleDocumentMouseUp = (nativeEvent: MouseEvent) => {
    const { x, y } = this._getMousePosition(nativeEvent);
    const mouseEventParam: SyntheticMouseEventParams = {
      x,
      y,
      bubbles: nativeEvent.bubbles,
      original: nativeEvent,
      timeStamp: nativeEvent.timeStamp,
    };
    if (this._draggingTarget) {
      const onDragEvent = new SyntheticDragEvent('dragend', {
        ...mouseEventParam,
        ...this._getDragParam(mouseEventParam),
      });
      this._dispatchSyntheticEvent(onDragEvent, this._draggingTarget);
    }
    this._draggingTarget = null;
  };

  private _getMousePosition(event: MouseEvent | Touch): { x: number; y: number } {
    // firefox svg下offsetX指向了svg元素的偏移
    if ((event as MouseEvent).offsetX && this.render.renderer !== 'svg') {
      return { x: (event as MouseEvent).offsetX, y: (event as MouseEvent).offsetY };
    }
    return getTouchOffsetPosition(this.render.getDom() as HTMLDivElement, event.clientX, event.clientY);
  }

  private _getHandleGroup() {
    return !this._eventOnly ? this.render.getRoot() : this.render.getEventGroup();
  }

  private _detachEvents() {
    if (!this.render.isBrowser()) {
      return;
    }
    const dom = this.render.getDom();
    dom.removeEventListener('wheel', this._syntheticMouseEvent);
    dom.removeEventListener('contextmenu', this._syntheticMouseEvent);
    dom.removeEventListener('mousedown', this._syntheticMouseEvent);
    dom.removeEventListener('mouseup', this._syntheticMouseEvent);
    dom.removeEventListener('mousemove', this._syntheticMouseEvent);
    dom.removeEventListener('click', this._syntheticMouseEvent);
    dom.removeEventListener('dblclick', this._syntheticMouseEvent);
    dom.removeEventListener('touchstart', this._syntheticTouchEvent);
    dom.removeEventListener('touchmove', this._syntheticTouchEvent);
    dom.removeEventListener('touchend', this._syntheticTouchEvent);
    dom.removeEventListener('touchcancel', this._syntheticTouchEvent);
    dom.removeEventListener('mouseleave', this._handleMouseLeave);
    dom.removeEventListener('mouseenter', this._handleMouseEnter);
    document.removeEventListener('mouseup', this._handleDocumentMouseUp);
  }

  private _initEvents() {
    if (!this.render.isBrowser()) {
      return;
    }
    const dom = this.render.getDom();
    // https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
    let passiveSupported = false;
    try {
      const options = Object.defineProperty({}, 'passive', {
        get: function () {
          passiveSupported = true;
        },
      });

      window.addEventListener('test', null, options);
    } catch (err) {}
    dom.addEventListener(
      'wheel',
      this._syntheticMouseEvent,
      passiveSupported ? { passive: false } : false,
    );
    dom.addEventListener('contextmenu', this._syntheticMouseEvent);
    dom.addEventListener('mousedown', this._syntheticMouseEvent);
    dom.addEventListener('mouseup', this._syntheticMouseEvent);
    dom.addEventListener('mousemove', this._syntheticMouseEvent);
    dom.addEventListener('click', this._syntheticMouseEvent);
    dom.addEventListener('dblclick', this._syntheticMouseEvent);
    dom.addEventListener(
      'touchstart',
      this._syntheticTouchEvent,
      passiveSupported ? { passive: true } : false,
    );
    dom.addEventListener(
      'touchmove',
      this._syntheticTouchEvent,
      passiveSupported ? { passive: false } : false,
    );
    dom.addEventListener('touchend', this._syntheticTouchEvent);
    dom.addEventListener('touchcancel', this._syntheticTouchEvent);
    dom.addEventListener('mouseleave', this._handleMouseLeave);
    dom.addEventListener('mouseenter', this._handleMouseEnter);
    document.addEventListener('mouseup', this._handleDocumentMouseUp);
  }

  private _dispatchSyntheticEvent(event: SyntheticEvent, target: Element, count = 0) {
    if (!target) {
      return;
    }
    const isRoot = this.render.getRoot() === target;

    if (isRoot) {
      this.render.dispatch(event.type, event);
    }

    if (event instanceof SyntheticMouseEvent) {
      if (count === 0) {
        event.target = target;
      }
      (event as SyntheticMouseEvent).currentTarget = target;
    }

    const { bubbles, isPropagationStopped } = event;

    if (event.type === 'drag' && count === 0) {
      const dragEvent = event as SyntheticDragEvent;
      let dx = dragEvent.dx;
      let dy = dragEvent.dy;
      if (target.attr.getDragOffset) {
        const offset = target.attr.getDragOffset(dragEvent);
        dx = offset.x;
        dy = offset.y;
      }

      target.dragMoveBy(dx, dy);
      // todo 如果脏数据超过了脏限制,不要实时刷新
      if (
        this.render.renderer === 'canvas' &&
        !this._eventOnly &&
        !(this.render.getPainter() as CanvasPainter).isFullPaintNextFrame()
      ) {
        this.render.getPainter().onFrame();
      }
    }

    target.dispatch(event.type, event);

    if (bubbles && !isPropagationStopped && target.parentNode) {
      count++;
      this._dispatchSyntheticEvent(event, (target.parentNode as any) as Element, count);
    }
    // todo 拖动行为
  }

  private _getDragParam(
    event: SyntheticMouseEventParams | SyntheticTouch,
  ): Pick<SyntheticDragEventParams, 'startX' | 'startY' | 'offsetX' | 'offsetY' | 'dx' | 'dy'> {
    const { x: startX, y: startY } = this._dragStartMouse;
    const { x: prevX, y: prevY } = this._prevMousePosition || { x: startX, y: startY };
    const { x, y } = event;
    const offsetX = x - startX;
    const offsetY = y - startY;
    const dx = x - prevX;
    const dy = y - prevY;
    return {
      startX,
      startY,
      offsetX,
      offsetY,
      dx,
      dy,
    };
  }

  private _findTouch(touches: SyntheticTouch[], id: number): SyntheticTouch {
    return touches.filter(touch => touch.identifier === id)[0];
  }

  private _onRenderDirty = () => {
    if (!this._prevMousePosition) {
      return;
    }
    const { x, y } = this._prevMousePosition;
    this._syntheticMouseEvent(
      {
        type: '_onFrame',
        x,
        y,
        bubbles: true,
        timeStamp: Date.now(),
      } as any,
      false,
    );
  };

  private _synthetickOverOutEvent(
    prevMouseTarget: Element,
    target: Element,
    mouseEventParam: SyntheticMouseEventParams,
  ) {
    const mouseoutEvent = new SyntheticMouseEvent('mouseout', mouseEventParam);
    const mouseoverEvent = new SyntheticMouseEvent('mouseover', mouseEventParam);
    this._dispatchSyntheticEvent(mouseoutEvent, prevMouseTarget);
    this._dispatchSyntheticEvent(mouseoverEvent, target);
    const containSelf = true;
    const prevTargetParentNodes = prevMouseTarget
      ? prevMouseTarget.getAncestorNodes(containSelf)
      : [];
    const currentTargetParentNodes = target.getAncestorNodes(containSelf);
    prevTargetParentNodes.forEach(prevNode => {
      if (!prevNode.contains(target)) {
        const mouseleaveEvent = new SyntheticMouseEvent('mouseleave', {
          ...mouseEventParam,
          bubbles: false,
        });
        this._dispatchSyntheticEvent(mouseleaveEvent, prevNode);
      }
    });
    currentTargetParentNodes.forEach(currentNode => {
      if (!currentNode.contains(prevMouseTarget)) {
        const mouseenterEvent = new SyntheticMouseEvent('mouseenter', {
          ...mouseEventParam,
          bubbles: false,
        });
        this._dispatchSyntheticEvent(mouseenterEvent, currentNode);
      }
    });
  }
}
