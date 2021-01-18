import Render from '../render';
import CanvasPainter from '../painter/CanvasPainter';
import Element from '../shapes/Element';
import { valueToRgb } from '../color';
import { SyntheticEvent, SyntheticMouseEvent, SyntheticTouchEvent, SyntheticDragEvent, EventConf, } from '../event';
import { inBBox } from '../utils/bbox';
import * as mat3 from '../../js/mat3';
import { transformMat3 } from '../utils/vec2';

interface EventDetail {
  x: number;
  y: number;
  detail: any;
}

// 给touches使用
const tempPickingCache: Record<string, Element> = {};

export default class EventHandle {
  public render: Render;

  private _currentMousePosition: { x: number; y: number } | null;

  private _draggingTarget: Element;

  private _prevMouseTarget: Element;

  private _prevTouchTarget: Record<number, Element>;

  private _PixelPainter: CanvasPainter;

  public constructor(render: Render) {
    this.render = render;
    this._PixelPainter = new CanvasPainter(render, true);
    this._initEvents();
  }

  public onFrame() {
    // todo
    // 检测currentTarget的状态(是否挂载, 是否仍然在图形中, 否则更新事件).
    // 优化手段, 检测上次对象是否依然挂载, 包围盒是否依然包含该点
    // 优化手段2: 增加debounce或throttle

    if (this._currentMousePosition) {
      const { x, y } = this._currentMousePosition;
      // this.pickTarget(x, y);
    }
  }

  public pickTarget(x: number, y: number): Element {
    console.time('pick');

    const pixelPainter = this._PixelPainter;
    const ignoreInvisibleNodes = true;
    let target: Element;
    let pickNodes = this.render.getAllLeafNodes(ignoreInvisibleNodes).reverse();

    this.render.getRoot().resetPickRGB();

    // 初步过滤掉不显示和不触发事件的元素, 以及不在包围盒中的
    pickNodes = pickNodes.filter(
      node =>
        node.attr.display &&
        node.getExtendAttr('pointerEvents') !== 'none' &&
        inBBox(node.getClientBoundingRect(), x, y),
    );

    // todo  自己几何检测 文本图像, 矩形, 圆等可以做的事
    // 倒排, 要考虑剪切, 逆矩阵坐标

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

    console.log('gpu pick size ', gpuPickNodes.length);

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

    console.timeEnd('pick');
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

  private _syntheticMouseEvent = (nativeEvent: MouseEvent) => {
    // todo统一mousewheel事件
    const {x, y} = this._getMousePosition(nativeEvent);
    const target = this.pickTarget(x, y);
    const prevMouseTarget = this._prevMouseTarget;
    const draggingTarget = this._draggingTarget;
    const isRoot = this.render.getRoot() === target;
    const event: SyntheticMouseEvent = new SyntheticMouseEvent(nativeEvent.type, {
      x,
      y,
      detail: nativeEvent.detail,
      bubbles: nativeEvent.bubbles,
      original: nativeEvent,
      timeStamp: Date.now(),
    });
    this._dispatchSyntheticMouseEvent(event, target);
    
    if (event.type === 'mouseup' || event.type === 'mousedown' || event.type === 'mousemove') {
      if (draggingTarget) {
        const eventMap = {
          mousedown: 'dragstart',
          mousemove: 'drag',
          mouseup: 'dragend'
        };
        const eventType = eventMap[event.type];
        const onDragEvent = new SyntheticDragEvent(eventType, {
          ...event,
          startX: 0,
          startY: 0,
          offsetX: 0,
          offsetY: 0,
          dx: 0,
          dy: 0,
        })
        this._dispatchSyntheticMouseEvent(onDragEvent, draggingTarget);
      }
    }

    if (event.type === 'mousemove') {
      if (this.render.isBrowser()) {
        const cursor = target.getExtendAttr('cursor');
        this.render.getDom().style.cursor = cursor;
      }
      if (prevMouseTarget !== target) {
        const mouseoutEvent = new SyntheticMouseEvent('mouseout', event);
        const mouseoverEvent = new SyntheticMouseEvent('mouseover', event);
        this._dispatchSyntheticMouseEvent(mouseoutEvent, prevMouseTarget);
        this._dispatchSyntheticMouseEvent(mouseoverEvent, target);
        const containSelf = true;
        const prevTargetParentNodes = prevMouseTarget ? prevMouseTarget.getAncestorNodes(containSelf) : [];
        const currentTargetParentNodes = target.getAncestorNodes(containSelf);
        prevTargetParentNodes.forEach(prevNode => {
          if (!prevNode.contains(target)) {
            const mouseleaveEvent = new SyntheticMouseEvent('mouseleave', {
              ...event,
              bubbles:false,
            });
            this._dispatchSyntheticMouseEvent(mouseleaveEvent, prevNode);
          }
        });
        currentTargetParentNodes.forEach(currentNode => {
          if (!currentNode.contains(prevMouseTarget)) {
            const mouseenterEvent = new SyntheticMouseEvent('mouseenter', {
              ...event,
              bubbles:false,
            });
            this._dispatchSyntheticMouseEvent(mouseenterEvent, currentNode);
          }
        })
      }
    }

  }

  private _syntheticTouchEvent = (nativeEvent: TouchEvent) => {

  }

  private _handleMouseLeave = (event: WheelEvent) => {
    // todo
    this._currentMousePosition = null;
  };

  private _handleMouseEnter = (event: WheelEvent) => {
    // todo
  };

  private _handleDocumentTouchEnd = (event: MouseEvent) => {
    // todo
  };

  private _handleDocumentMouseUp = (event: MouseEvent) => {
    // todo
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
    if (count === 0) {
      event.target = target;
    }
    event.currentTarget = target;
    const {bubbles, isPropagationStopped, } = event;
    const eventKey = Object.keys(target.attr).filter(key => key.toLowerCase() === ('on' + event.type))[0]  as keyof EventConf;
    if (target.attr[eventKey]) {
      target.attr[eventKey](event as any);
    }
    if (bubbles && !isPropagationStopped && target.parentNode) {
      count++;
      this._dispatchSyntheticMouseEvent(event, target.parentNode, count);
    }
  }
}

