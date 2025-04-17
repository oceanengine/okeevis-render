import normalizeWheel from 'normalize-wheel';
import Render from '../render';
import CanvasPainter from '../painter/CanvasPainter';
import Element from '../shapes/Element';
import { valueToRgb } from '../color';
import { DOM_LAYER_CLASS } from '../constant';

import {
  SyntheticEvent,
  SyntheticMouseEvent,
  SyntheticTouchEvent,
  SyntheticDragEvent,
  SyntheticWheelEvent,
  SyntheticFocusEvent,
  SyntheticKeyboardEvent,
} from './index';
import { SyntheticDragEventParams } from './SyntheticDragEvent';
import { SyntheticMouseEventParams } from './SyntheticMouseEvent';
import { SyntheticWheelEventParams } from './SyntheticWheelEvent';
import { SyntheticFocusEventParams } from './SyntheticFocusEvent';
import { SyntheticKeyboardEventParams } from './SyntheticKeyboardEvent';
import { SyntheticTouchEventParams, SyntheticTouch } from './SyntheticTouchEvent';
import { getTouchOffsetPosition } from '../utils/touch-offset';
import { inBBox } from '../utils/bbox';
import * as lodash from '../utils/lodash';
import { isMobile } from '../utils/env';

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

  private _mouseDownTarget: Element | null = null;

  private _focusTarget: Element | null = null;

  private _prevMouseTarget: Element | null = null;

  private _prevMousePosition: { x: number; y: number } | null = null;

  private _dragStartMouse: { x: number; y: number } | null = null;

  private _dragStartTouchId: number;

  private _nativeDragoverTarget: Element;

  private _eventOnly: boolean;

  private _PixelPainter: CanvasPainter;

  private _lastMouseSyntheticTimestamp: number;

  private _touchStartInfo: SyntheticTouchEvent;

  private _cancelClick: boolean = true;

  private _frameCallback: Function[] = [];

  public constructor(render: Render, eventOnly: boolean = false) {
    this.render = render;
    this._PixelPainter = new CanvasPainter(render, true);
    this._eventOnly = eventOnly;
    this._initEvents();
    this._onRenderDirty = lodash.throttle(this._onRenderDirty, AUTO_DETECT_THROTTLE);
  }

  public onFrame() {
    this._frameCallback.forEach(fn => fn());
    this._frameCallback.length = 0;
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

  public dispatchEvent(event: SyntheticEvent, target: Element) {
    this._dispatchSyntheticEvent(event, target);
  }

  public pickTarget(x: number, y: number): Element {
    // console.time('pick');
    const pixelPainter = this._PixelPainter;
    let target: Element;
    function filter(node: Element): boolean {
      return (
        inBBox(node.getBoundingClientRect(), x, y) && node.getExtendAttr('pointerEvents') !== 'none'
      );
    }
    const pickNodes = this._getHandleGroup().getAllLeafNodes([], filter).sort((a, b) => {
      return (a.attr.zIndex || 0) - (b.attr.zIndex || 0);
    }).reverse();

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

    const gpuPickNodes = pickNodes.filter(gpuNode => gpuNode.pickByGPU());
    gpuPickNodes.forEach((item, index) => {
      item.pickRGB = valueToRgb(index + 1);
    });

    // console.log('gpu pick size ', gpuPickNodes.length);

    if (gpuPickNodes.length > 0 && pixelPainter.getContext().getImageData) {
      pixelPainter.paintAt(x, y);
      // const prevImageData = pixelPainter.getImageData(x, y);
      try {
        // may thrown error when contains cross origin image
        const imageData = pixelPainter.getImageData(0, 0, 1, 1);
        if (imageData) {
          const pickValue = imageData.data;
          const r0 = pickValue[0];
          const g0 = pickValue[1];
          const b0 = pickValue[2];

          for (let i = 0; i < pickNodes.length; i++) {
            const currentNode = pickNodes[i];
            if (!currentNode.pickByGPU()) {
              continue;
            }
            const [r, g, b] = currentNode.pickRGB;
            const gap = Math.abs(r - r0) + Math.abs(g - g0) + Math.abs(b - b0);
            if (gap < 3) {
              gpuPickIndex = i;
              break;
            }
          }
        }
      } catch (err) {}
      gpuPickNodes.forEach(gpuNode => gpuNode.resetPickRGB());
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

  public focusElement(el: Element<any>, options: { preventScroll?: boolean  }) {
    if (!lodash.isNumber(el.attr.tabIndex)) {
      return;
    }
    if (this._focusTarget === el) {
      return;
    }
    if (!this._focusTarget) {
      this.render.getDom().focus();
    }

    this._syntheticFocusEvent(this._focusTarget, el);
  }

  public blurElement(el: Element<any>) {
    if (!lodash.isNumber(el.attr.tabIndex)) {
      return;
    }
    if (this._focusTarget !== el) {
      return;
    }
    this._syntheticFocusEvent(this._focusTarget, null);
  }

  public dispose() {
    if (this.render.isBrowser()) {
      this._detachEvents();
    }
    this._PixelPainter.dispose();
    this._frameCallback.length = 0;
  }

  private _syntheticMouseEvent = (nativeEvent: MouseEvent, isNative: boolean = true) => {
    if (this.render.simulateClickEvent && nativeEvent.type === 'click' && isNative) {
      return;
    }
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
    if (!this._draggingTarget || this._eventOnly) {
      this._dispatchSyntheticEvent(event, target);
    }

    if (event.type === 'mousedown' || event.type === 'mousemove') {
      if (event.type === 'mousedown' && nativeEvent.button !== 2) {
        this._mouseDownTarget = target;
        const parentNodes = target.getAncestorNodes(true);
        let focusNode: Element;
        for (let i = 0; i < parentNodes.length; i++) {
          if (parentNodes[i].attr.draggable) {
            this._draggingTarget = parentNodes[i];
            this._dragStartMouse = { x, y };
            nativeEvent.preventDefault && nativeEvent.preventDefault();
            break;
          }
        }
        for (let i = 0; i < parentNodes.length; i++) {
          if (lodash.isNumber(parentNodes[i].attr.tabIndex)) {
            focusNode = parentNodes[i];
            break;
          }
        }

        if (!this._focusTarget && focusNode && this.render.isBrowser()) {
          this.render.getDom().focus();
        }

        this._syntheticFocusEvent(this._focusTarget, focusNode);
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
      if (prevMouseTarget !== target && (!this._draggingTarget || this._eventOnly)) {
        this._synthetickOverOutEvent(prevMouseTarget, target, mouseEventParam);
      }
    }
    if (event.type === 'mousemove') {
      this._prevMousePosition = { x, y };
      this._prevMouseTarget = target;
    }
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
        clientX: x,
        clientY: y,
        target,
      };
    });
    const draggingTouch = this._findTouch(touchesList, this._dragStartTouchId);
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
    if (!draggingTouch || this._eventOnly) {
      touchEventParam.changedTouches.forEach(touch =>
        this._dispatchSyntheticEvent(event, touch.target),
      );
    }
    const dragEventParam: SyntheticDragEventParams = {
      startX: null,
      startY: null,
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
        const { x: prevX, y: prevY } = this._touchStartInfo;
        const dx = Math.abs(event.x - prevX);
        const dy = Math.abs(event.y - prevY);
        const touchBoundary = 10;
        if (dx > touchBoundary || dy > touchBoundary) {
          this._cancelClick = true;
        }
      }
      if (this._draggingTarget && draggingTouch) {
        if (this._getHandleGroup() === this.render.getRoot()) {
          nativeEvent.preventDefault && nativeEvent.preventDefault();
        }
        const dragParam = {
          ...dragEventParam,
          x: draggingTouch.x,
          y: draggingTouch.y,
          ...this._getDragParam(this._findTouch(touchesList, dragStartTouchId)),
        };
        const onDragEvent = new SyntheticDragEvent('drag', dragParam);
        this._dispatchSyntheticEvent(onDragEvent, this._draggingTarget);
      }
      if (draggingTouch) {
        this._prevMousePosition = { x: draggingTouch.x, y: draggingTouch.y };
      }
    }

    if (nativeEvent.type === 'touchend' || nativeEvent.type === 'touchcancel') {
      if (this.render.simulateClickEvent && this._touchStartInfo) {
        if (!this._cancelClick && event.timeStamp - this._touchStartInfo.timeStamp < 300) {
          const clickEvent = new SyntheticMouseEvent('click', {
            x: event.x,
            y: event.y,
            original: { x: event.x, y: event.y },
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

    // synthetic mouseover mouseout
    if (changedTouches.length) {
      const target = synthetichChangedTouches[0].target;
      if (target !== prevMouseTarget && (!draggingTouch || this._eventOnly)) {
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
    if (this._draggingTarget) {
      return;
    }
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
    if (!this._draggingTarget) {
      this._prevMousePosition = null;
    } else {
      const onDragEvent = new SyntheticDragEvent('drag', {
        ...eventParam,
        ...this._getDragParam(eventParam),
      });
      this._dispatchSyntheticEvent(onDragEvent, this._draggingTarget);
      this._prevMousePosition = { x, y };
    }
    this._prevMouseTarget = this._draggingTarget ? this._draggingTarget : null;
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
    // trigger mouseover, mouseenter event
    const parentNodes = target.getAncestorNodes(true);
    parentNodes.forEach(node => {
      const mouseEnterEvent = new SyntheticMouseEvent('mouseenter', {
        ...eventParam,
        bubbles: true,
      });
      this._dispatchSyntheticEvent(mouseEnterEvent, node);
    });

    if (this._draggingTarget) {
      const onDragEvent = new SyntheticDragEvent('drag', {
        ...eventParam,
        ...this._getDragParam(eventParam),
      });
      this._dispatchSyntheticEvent(onDragEvent, this._draggingTarget);
      this._prevMousePosition = { x, y };
    }

    this._prevMousePosition = { x, y };
    this._prevMouseTarget = target;
  };

  private _handleNativeDnDEvent = (nativeEvent: DragEvent) => {
    // dragover drop
    nativeEvent.preventDefault();
    const { x, y } = this._getMousePosition(nativeEvent);
    const target = this.pickTarget(x, y);
    const eventParam = {
      x,
      y,
      bubbles: nativeEvent.bubbles,
      original: nativeEvent,
      timeStamp: nativeEvent.timeStamp,
    };
    if (nativeEvent.type === 'drop') {
      const dropEvent = new SyntheticMouseEvent(nativeEvent.type, {
        ...eventParam,
      });
      this._dispatchSyntheticEvent(dropEvent, target);
    }
    if (nativeEvent.type === 'dragover') {
      const prevDragOverTarget = this._nativeDragoverTarget;
      const dragOverEvent = new SyntheticMouseEvent('dragover', eventParam);
      this._dispatchSyntheticEvent(dragOverEvent, target);
      this._nativeDragoverTarget = target;
      if (prevDragOverTarget !== target) {
        const dragEnterEvent = new SyntheticMouseEvent('dragenter', eventParam);
        const dragLeaveEvent = new SyntheticMouseEvent('dragleave', eventParam);
        this._dispatchSyntheticEvent(dragEnterEvent, target);
        this._dispatchSyntheticEvent(dragLeaveEvent, prevDragOverTarget);
      }
    }
  };

  private _handleNativeKeyboardEvent = (nativeEvent: KeyboardEvent & {char: string}) => {
    const {
      altKey,
      char,
      charCode,
      code,
      ctrlKey,
      isComposing,
      key,
      keyCode,
      location,
      metaKey,
      repeat,
      shiftKey,
    } = nativeEvent
    const param: SyntheticKeyboardEventParams = {
      bubbles: true,
      original: nativeEvent,
      altKey,
      char,
      charCode,
      code,
      ctrlKey,
      isComposing,
      key,
      keyCode,
      location,
      metaKey,
      repeat,
      shiftKey,
    };
    const keyboardEvent = new SyntheticKeyboardEvent(nativeEvent.type, param);
    const target = this._focusTarget ?? this._getHandleGroup();
    this._dispatchSyntheticEvent(keyboardEvent, target);
    // tab switch focus
    if (nativeEvent.type === 'keydown' && !this._eventOnly && nativeEvent.keyCode === 9) {
      const tabFocusableNodes: Element[] = [];
      this._getHandleGroup().traverse(node => {
        if (lodash.isNumber(node.attr.tabIndex) && node.attr.display) {
          if (node.attr.tabIndex >=0 || node === this._focusTarget) {
            tabFocusableNodes.push(node);
          }
        }
      });
 
      // [1, 2, 3, 0, 0, 0]; -1 keep position
      tabFocusableNodes.sort((a, b) => {
        // keep currentzindex
        const tabIndexA = a.attr.tabIndex;
        const tabIndexB = b.attr.tabIndex
        if (tabIndexA < 0 || tabIndexB < 0) {
          return 0;
        }
        if (tabIndexA === 0 || tabIndexB === 0) {
          // nagative in from
          return tabIndexB - tabIndexA
        }

        if (tabIndexA > 0 && tabIndexB > 0) {
          return tabIndexA - tabIndexB;
        }

      });

      if (this._focusTarget) {
        const curIndex = tabFocusableNodes.indexOf(this._focusTarget);
        const prev = tabFocusableNodes[curIndex - 1];
        const next = tabFocusableNodes[curIndex + 1];
        if (nativeEvent.shiftKey) {
          prev && nativeEvent.preventDefault();
          this._syntheticFocusEvent(this._focusTarget, prev);
        } else if (next) {
          nativeEvent.preventDefault();
          this._syntheticFocusEvent(this._focusTarget, next);
        }
      } else {
        if (tabFocusableNodes.length) {
          nativeEvent.preventDefault();
          if (!nativeEvent.shiftKey) {
            this._syntheticFocusEvent(null, tabFocusableNodes[0]);
          } else {
            this._syntheticFocusEvent(null, tabFocusableNodes[tabFocusableNodes.length -1]);
          }
        }
      }
    }
    // simulate enter click event
    // if (nativeEvent.type === 'keydown' && !this._eventOnly && nativeEvent.keyCode === 13) {
    //   // html trigger click only on <a>
    //   if (this._focusTarget) {
    //     const clickEvent = new SyntheticMouseEvent('click', {
    //       x: 0,
    //       y: 0,
    //       bubbles: true,
    //     });
    //     this._dispatchSyntheticEvent(clickEvent, this._focusTarget);
    //   }
    // }
  };

  private _handleDocumentMouseUp = (nativeEvent: MouseEvent) => {
    this._mouseDownTarget?.setState('active', false);
    if (!isMobile) {
      this._prevMouseTarget = null;
    }
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
      setTimeout(() => {
        // mouseup to dom
        this._prevMouseTarget = this._mouseDownTarget;
        this.dispatch('mousemove',{x, y});
      });
    }
    this._draggingTarget = null;
  };

  private _handleDocumentMouseMove = (nativeEvent: MouseEvent) => {
    // drag on mousemove outside canvas;
    const target = nativeEvent.target;
    if (!this._draggingTarget || this.render.getDom().contains(target as HTMLElement)) {
      return;
    }
    (nativeEvent as any).__OUTSIDE_MOVE__ = true;
    this._syntheticMouseEvent(nativeEvent);
  };

  private _isEventFromDomNode(event: MouseEvent | Touch) {
    const target = event.target as HTMLElement;
    let node = target;
    while (node) {
      if (node.className === DOM_LAYER_CLASS) {
        return true;
      }
      if (node === this.render.getDom()) {
        return false;
      }
      node = node.parentNode as HTMLElement;
    }
    return false;
  }

  private _getMousePosition(event: MouseEvent | Touch): { x: number; y: number } {
    // firefox svg offsetX is relative to svgElement target
    if (
      (event as MouseEvent).offsetX &&
      this.render.renderer !== 'svg' &&
      !this._isEventFromDomNode(event) &&
      !(event as any).__OUTSIDE_MOVE__
    ) {
      return { x: (event as MouseEvent).offsetX, y: (event as MouseEvent).offsetY };
    }
    return getTouchOffsetPosition(
      this.render.getDom() as HTMLDivElement,
      event.clientX,
      event.clientY,
    );
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
    dom.removeEventListener('drop', this._handleNativeDnDEvent);
    dom.removeEventListener('dragover', this._handleNativeDnDEvent);
    dom.removeEventListener('focus', this._handleDomFocus);
    dom.removeEventListener('blur', this._handleDomBlur);
    dom.removeEventListener('keydown', this._handleNativeKeyboardEvent);
    dom.removeEventListener('keypress', this._handleNativeKeyboardEvent);
    dom.removeEventListener('keyup', this._handleNativeKeyboardEvent);
    document.removeEventListener('mouseup', this._handleDocumentMouseUp);
    document.removeEventListener('mousemove', this._handleDocumentMouseMove);
  }

  private _initEvents() {
    if (!this.render.isBrowser()) {
      return;
    }
    const dom = this.render.getDom();
    dom.tabIndex = 0;
    dom.style.outline = 'none';
    // https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
    let passiveSupported = false;
    try {
      const options = Object.defineProperty({}, 'passive', {
        /* eslint-disable getter-return */
        get() {
          passiveSupported = true;
        },
      });

      window.addEventListener('test', null, options);
    } catch (err) {
      /* eslint-disable no-empty */
    }
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
    dom.addEventListener('drop', this._handleNativeDnDEvent);
    dom.addEventListener('dragover', this._handleNativeDnDEvent);
    dom.addEventListener('focus', this._handleDomFocus);
    dom.addEventListener('blur', this._handleDomBlur);
    dom.addEventListener('keydown', this._handleNativeKeyboardEvent);
    dom.addEventListener('keypress', this._handleNativeKeyboardEvent);
    dom.addEventListener('keyup', this._handleNativeKeyboardEvent);
    document.addEventListener('mouseup', this._handleDocumentMouseUp);
    document.addEventListener('mousemove', this._handleDocumentMouseMove);
  }

  private _dispatchSyntheticEvent(event: SyntheticEvent<any>, target: Element, count = 0) {
    if (!target) {
      return;
    }
    const isRoot = this.render.getRoot() === target;

    if (event.type.indexOf('touch') !== 0) {
      if (count === 0) {
        event.target = target;
      }
      (event as SyntheticMouseEvent).currentTarget = target;
    }

    if (isRoot) {
      this.render.dispatch(event.type, event as SyntheticMouseEvent | SyntheticDragEvent);
      event.runDefaultHandle();
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

      // 当使用脏矩形时，如果修改的步调和tick的不一致，会导致脏矩形错误,需要同步刷新
      // 事件的触发频率和tick不同步，如果不同步重绘，会导致残影
      if (!this._eventOnly && this.render.enableDirtyRect) {
        this._frameCallback.push(() => {
          target.dragMoveBy(dx, dy);
        });

        this.render.nextTick();
      } else {
        target.dragMoveBy(dx, dy);
      }
    }

    target.dispatch(event.type, event as any);

    if (bubbles && !isPropagationStopped && target.parentNode) {
      count++;
      this._dispatchSyntheticEvent(event, target.$$portal || target.parentNode as any as Element, count);
    }
  }

  private _getDragParam(
    event: SyntheticMouseEventParams | SyntheticTouch,
  ): Pick<SyntheticDragEventParams, 'startX' | 'startY' | 'dx' | 'dy'> {
    const { x: startX, y: startY } = this._dragStartMouse;
    const { x: prevX, y: prevY } = this._prevMousePosition || { x: startX, y: startY };
    const { x, y } = event;
    const dx = x - prevX;
    const dy = y - prevY;

    return {
      startX,
      startY,
      dx,
      dy,
    };
  }

  private _findTouch(touches: SyntheticTouch[], id: number): SyntheticTouch {
    return touches.filter(touch => touch.identifier === id)[0];
  }

  private _onRenderDirty = () => {
    if (isMobile) {
      return;
    }
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

  private _syntheticFocusEvent = (prevFocus: Element | null, curFocus: Element | null) => {
    if (prevFocus === curFocus) {
      return;
    }
    this._focusTarget = curFocus;
    const focusEventParam: SyntheticFocusEventParams = {
      bubbles: false,
    };
    const blurEventParam: SyntheticFocusEventParams = {
      bubbles: false,
    };
    if (prevFocus) {
      const blurEvent = new SyntheticFocusEvent('blur', blurEventParam);
      const blurOutEvent = new SyntheticFocusEvent('focusout', {
        ...blurEventParam,
        relatedTarget: curFocus,
        bubbles: true,
      });
      this._dispatchSyntheticEvent(blurEvent, prevFocus);
      this._dispatchSyntheticEvent(blurOutEvent, prevFocus);
    }
    if (curFocus) {
      const focusEvent = new SyntheticFocusEvent('focus', focusEventParam);
      const focusInEvent = new SyntheticFocusEvent('focusin', {
        ...focusEventParam,
        bubbles: true,
      });
      this._dispatchSyntheticEvent(focusEvent, curFocus);
      this._dispatchSyntheticEvent(focusInEvent, curFocus);
    }
  };

  private _handleDomBlur = () => {
    this._syntheticFocusEvent(this._focusTarget, null);
    if (!this._eventOnly) {
      this._dispatchSyntheticEvent(
        new SyntheticFocusEvent('blur', {
          bubbles: false,
        }),
        this.render.getRoot(),
      );
    }
  };

  private _handleDomFocus = (event: FocusEvent) => {
    if (!this._eventOnly) {
      this._dispatchSyntheticEvent(
        new SyntheticFocusEvent('focus', {
          bubbles: false,
          original: event,
        }),
        this.render.getRoot(),
      );
    }
  };

  private _synthetickOverOutEvent(
    prevMouseTarget: Element,
    target: Element,
    mouseEventParam: SyntheticMouseEventParams,
  ) {
    this._prevMouseTarget = target;
    const mouseoutEvent = new SyntheticMouseEvent('mouseout', {
     ...mouseEventParam,
     relatedTarget: target,
    });
    const mouseoverEvent = new SyntheticMouseEvent('mouseover', {
     ...mouseEventParam,
     relatedTarget: prevMouseTarget,
    });
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
          relatedTarget: target,
        });
        this._dispatchSyntheticEvent(mouseleaveEvent, prevNode);
      }
    });
    currentTargetParentNodes.forEach(currentNode => {
      if (!currentNode.contains(prevMouseTarget)) {
        const mouseenterEvent = new SyntheticMouseEvent('mouseenter', {
          ...mouseEventParam,
          bubbles: false,
          relatedTarget: prevMouseTarget,
        });
        this._dispatchSyntheticEvent(mouseenterEvent, currentNode);
      }
    });
  }
}
