import Render from '../render';
import CanvasPainter from '../painter/CanvasPainter';
import Element from '../shapes/Element';
import { valueToRgb } from '../color';
import {
  // SyntheticEvent,
  SyntheticMouseEvent,
  // SyntheticTouchEvent,
  SyntheticDragEvent,
  EventConf,
} from './index';
import { SyntheticDragEventParams } from './SyntheticDragEvent';
import { SyntheticMouseEventParams } from './SyntheticMouseEvent';

import { inBBox } from '../utils/bbox';
import * as mat3 from '../../js/mat3';
import { transformMat3 } from '../utils/vec2';
import * as lodash from '../utils/lodash';

// 给touches使用
// const tempPickingCache: Record<string, Element> = {};

export default class EventHandle {
  public render: Render;

  private _draggingTarget: Element | null = null;

  private _prevMouseTarget: Element | null = null;

  private _prevMousePosition: { x: number; y: number } | null = null;

  private _dragStartMouse: { x: number; y: number } | null = null;

  private _prevTouchTarget: Record<number, Element> | null = null;

  private _PixelPainter: CanvasPainter;

  public constructor(render: Render) {
    this.render = render;
    this._PixelPainter = new CanvasPainter(render, true);
    this._initEvents();
    this.onRenderDirty = lodash.throttle(this.onRenderDirty, 100);
  }

  public onFrame() {
    if (this.render.needUpdate() && this._prevMousePosition) {
      this.onRenderDirty();
    }
  }

  public onRenderDirty = () => {
    if (!this._prevMouseTarget) {
      return;
    }
    const { x, y } = this._prevMousePosition;
    this._syntheticMouseEvent({
      type: 'mousemove',
      x,
      y,
      bubbles: true,
      timeStamp: Date.now(),
    } as any, false);
  };

  public pickTarget(x: number, y: number): Element {
    // console.time('pick');

    const pixelPainter = this._PixelPainter;
    const ignoreInvisibleNodes = true;
    const ignoreMute = true; // pointerevent none
    let target: Element;
    // 初步过滤掉不显示和不触发事件的元素, 过滤掉拖拽中的
    let pickNodes = this.render.getAllLeafNodes(ignoreInvisibleNodes, ignoreMute).reverse().filter(item => item !== this._draggingTarget);

    this.render.getRoot().resetPickRGB();

    // 过渡掉不在包围盒中的
    pickNodes = pickNodes.filter(
      node => node.attr.display && inBBox(node.getClientBoundingRect(), x, y),
    );

    let geometryPickIndex: number = -1;
    let gpuPickIndex: number = -1;

    for (let i = 0; i < pickNodes.length; i++) {
      const node = pickNodes[i];
      if (node.pickByGPU) {
        continue;
      }
      const absTransform = node.getGlobalTransform();
      const inverMatrix = mat3.invert(mat3.create(), absTransform);
      const vec2: [number, number] = [0, 0];
      transformMat3(vec2, [x, y], inverMatrix);
      const inShape = node.isInShape(vec2[0], vec2[1]);
      const inClip = node.isInClip(vec2[0], vec2[1]);
      if (inShape && inClip) {
        geometryPickIndex = i;
        break;
      }
    }

    const gpuPickNodes = pickNodes.filter(node => node.pickByGPU);
    gpuPickNodes.forEach((item, index) => {
      // 颜色空间大约有40W个,基本够用.
      item.pickRGB = valueToRgb(index + 1);
    });

    // console.log('gpu pick size ', gpuPickNodes.length);

    if (gpuPickNodes.length > 0) {
      pixelPainter.paintAt(x, y);
      // todo 考虑小程序getImageData兼容
      // const prevImageData = pixelPainter.getImageData(x, y);
      const imageData = pixelPainter.getImageData(0, 0, 1, 1);
      const pickValue = imageData.data;
      const r0 = pickValue[0];
      const g0 = pickValue[1];
      const b0 = pickValue[2];

      for (let i = 0; i < pickNodes.length; i++) {
        const node = pickNodes[i];
        if (!node.pickByGPU) {
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
    return target || this.render.getRoot();
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
    const mouseEventParam: SyntheticMouseEventParams = {
      x,
      y,
      detail: nativeEvent.detail,
      bubbles: nativeEvent.bubbles,
      original: nativeEvent,
      timeStamp: nativeEvent.timeStamp,
    };
    const event: SyntheticMouseEvent = new SyntheticMouseEvent(nativeEvent.type, mouseEventParam);
    this._dispatchSyntheticMouseEvent(event, target);

    if (event.type === 'mousedown' || event.type === 'mousemove') {
      // todo 父元素也可以拖动
      if (event.type === 'mousedown') {
        const parentNodes = target.getAncestorNodes(true);
        for (let i = 0; i < parentNodes.length; i++) {
          if (parentNodes[i].attr.draggable) {
            this._draggingTarget = parentNodes[i];
            this._dragStartMouse = { x, y };
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
        this._dispatchSyntheticMouseEvent(onDragEvent, this._draggingTarget);
        if (prevMouseTarget !== target) {
          const onDragLeaveEvent = new SyntheticDragEvent('dragleave', dragParam);
          const onDragOverEvent = new SyntheticDragEvent('dragover', dragParam);
          this._dispatchSyntheticMouseEvent(onDragLeaveEvent, prevMouseTarget);
          this._dispatchSyntheticMouseEvent(onDragOverEvent, target);
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
      this._dispatchSyntheticMouseEvent(dropEvent, target);
    }

    if (event.type === 'mousemove' || event.type === 'wheel') {
      if (this.render.isBrowser()) {
        const cursor = this._draggingTarget ? this._draggingTarget.getExtendAttr('cursor') : target.getExtendAttr('cursor');
        this.render.getDom().style.cursor = cursor;
      }
      if (prevMouseTarget !== target) {
        const mouseoutEvent = new SyntheticMouseEvent('mouseout', event);
        const mouseoverEvent = new SyntheticMouseEvent('mouseover', event);
        this._dispatchSyntheticMouseEvent(mouseoutEvent, prevMouseTarget);
        this._dispatchSyntheticMouseEvent(mouseoverEvent, target);
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
            this._dispatchSyntheticMouseEvent(mouseleaveEvent, prevNode);
          }
        });
        currentTargetParentNodes.forEach(currentNode => {
          if (!currentNode.contains(prevMouseTarget)) {
            const mouseenterEvent = new SyntheticMouseEvent('mouseenter', {
              ...mouseEventParam,
              bubbles: false,
            });
            this._dispatchSyntheticMouseEvent(mouseenterEvent, currentNode);
          }
        });
      }
    }

    this._prevMousePosition = { x, y };
    this._prevMouseTarget = target;
  };

  private _syntheticTouchEvent = (nativeEvent: TouchEvent) => {
    nativeEvent;
  };

  private _handleMouseLeave = (nativeEvent: WheelEvent) => {
    // todo
    const { x, y } = this._getMousePosition(nativeEvent);
    const target = this._prevMouseTarget || this.render.getRoot();
    const eventParam = {
      x,
      y,
      detail: nativeEvent.detail,
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
    this._dispatchSyntheticMouseEvent(mouseoutEvent, target);
    const parentNodes = target.getAncestorNodes(true);
    parentNodes.forEach(node => {
      const mouseLeaveEvent: SyntheticMouseEvent = new SyntheticMouseEvent(
        'mouseleave',
        eventParam,
      );
      this._dispatchSyntheticMouseEvent(mouseLeaveEvent, node);
    });
  };

  private _handleMouseEnter = (nativeEvent: WheelEvent) => {
    // todo
    const { x, y } = this._getMousePosition(nativeEvent);
    const target = this.pickTarget(x, y);
    if (this.render.isBrowser()) {
      const cursor = target.getExtendAttr('cursor');
      this.render.getDom().style.cursor = cursor;
    }
    const eventParam = {
      x,
      y,
      detail: nativeEvent.detail,
      bubbles: nativeEvent.bubbles,
      original: nativeEvent,
      timeStamp: nativeEvent.timeStamp,
    };
    const mouseoverEvent = new SyntheticMouseEvent('mouseover', {
      ...eventParam,
      bubbles: true,
    });
    this._dispatchSyntheticMouseEvent(mouseoverEvent, target);
    // 触发当前对象的mouseover, mouseenter事件
    const parentNodes = target.getAncestorNodes(true);
    parentNodes.forEach(node => {
      const mouseEnterEvent = new SyntheticMouseEvent('mouseenter', {
        ...eventParam,
        bubbles: true,
      });
      this._dispatchSyntheticMouseEvent(mouseEnterEvent, node);
    });
    this._prevMousePosition = { x, y };
    this._prevMouseTarget = target;
  };

  private _handleDocumentTouchEnd = (event: MouseEvent) => {
    event;
  };

  private _handleDocumentMouseUp = (nativeEvent: MouseEvent) => {
    const { x, y } = this._getMousePosition(nativeEvent);
    const mouseEventParam: SyntheticMouseEventParams = {
      x,
      y,
      detail: nativeEvent.detail,
      bubbles: nativeEvent.bubbles,
      original: nativeEvent,
      timeStamp: nativeEvent.timeStamp,
    };
    if (this._draggingTarget) {
      const onDragEvent = new SyntheticDragEvent('dragend', {
        ...mouseEventParam,
        ...this._getDragParam(mouseEventParam),
      });
      this._dispatchSyntheticMouseEvent(onDragEvent, this._draggingTarget);
    }
    this._draggingTarget = null;
  };

  private _getMousePosition(event: MouseEvent): { x: number; y: number } {
    return { x: event.offsetX, y: event.offsetY };
  }

  private _detachEvents() {
    if (!this.render.isBrowser()) {
      return;
    }
    const dom = this.render.getDom();
    dom.removeEventListener('wheel', this._syntheticMouseEvent);
    dom.removeEventListener('mousedown', this._syntheticMouseEvent);
    dom.removeEventListener('mouseup', this._syntheticMouseEvent);
    dom.removeEventListener('mousemove', this._syntheticMouseEvent);
    dom.removeEventListener('click', this._syntheticMouseEvent);
    dom.removeEventListener('dblclick', this._syntheticMouseEvent);
    dom.removeEventListener('touchstart', this._syntheticTouchEvent);
    dom.removeEventListener('touchmove', this._syntheticTouchEvent);
    dom.removeEventListener('touchend', this._syntheticTouchEvent);
    dom.removeEventListener('mouseleave', this._handleMouseLeave);
    dom.removeEventListener('mouseenter', this._handleMouseEnter);
    document.removeEventListener('touchend', this._handleDocumentTouchEnd);
    document.removeEventListener('mouseup', this._handleDocumentMouseUp);
  }

  private _initEvents() {
    if (!this.render.isBrowser()) {
      return;
    }
    const dom = this.render.getDom();
    dom.addEventListener('wheel', this._syntheticMouseEvent);
    dom.addEventListener('mousedown', this._syntheticMouseEvent);
    dom.addEventListener('mouseup', this._syntheticMouseEvent);
    dom.addEventListener('mousemove', this._syntheticMouseEvent);
    dom.addEventListener('click', this._syntheticMouseEvent);
    dom.addEventListener('dblclick', this._syntheticMouseEvent);
    dom.addEventListener('touchstart', this._syntheticTouchEvent);
    dom.addEventListener('touchmove', this._syntheticTouchEvent);
    dom.addEventListener('touchend', this._syntheticTouchEvent);
    dom.addEventListener('mouseleave', this._handleMouseLeave);
    dom.addEventListener('mouseenter', this._handleMouseEnter);
    document.addEventListener('touchend', this._handleDocumentTouchEnd);
    document.addEventListener('mouseup', this._handleDocumentMouseUp);
  }

  private _dispatchSyntheticMouseEvent(event: SyntheticMouseEvent, target: Element, count = 0) {
    if (!target) {
      return;
    }
    const isRoot = this.render.getRoot() === target;
    if (isRoot) {
      this.render.dispatch(event.type, event);
    }
    if (count === 0) {
      event.target = target;
    }
    event.currentTarget = target;
    const { bubbles, isPropagationStopped } = event;

    const eventKey = Object.keys(target.attr).filter(
      key => key.toLowerCase() === 'on' + event.type,
    )[0] as keyof EventConf;

    if (event.type === 'drag' && count === 0) {
      const dragEvent = event as SyntheticDragEvent;
      let dx = dragEvent.dx;
      let dy = dragEvent.dy;
      if (target.attr.getDragOffset) {
        const offset = target.attr.getDragOffset(dragEvent);
        dx = offset.x;
        dy = offset.y;
      }
      target.translate(dx, dy);
    }

    if (target.attr[eventKey]) {
      (target.attr[eventKey] as Function)(event as any);
    }
    target.dispatch(event.type, event);
    if (bubbles && !isPropagationStopped && target.parentNode) {
      count++;
      this._dispatchSyntheticMouseEvent(event, target.parentNode, count);
    }
    // todo 拖动行为
  }

  private _getDragParam(
    event: SyntheticMouseEventParams,
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
}
