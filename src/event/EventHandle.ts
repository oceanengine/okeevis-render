import Render from '../render';
import CanvasPainter from '../painter/CanvasPainter';
import Element from '../shapes/Element';
import { valueToRgb } from '../color';
import * as lodash from '../utils/lodash';

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
    const ignoreInvisible = true;
    const leafNodes = this.render.getAllLeafNodes(ignoreInvisible);
    // todo 过渡pointerEvents:none
    // todo 过渡display: none
    // todo f过渡
    leafNodes.forEach((item, index) => {
      // 颜色空间大约有40W个,基本够用.
      item.pickRGB = valueToRgb(index + 1);
    });
    pixelPainter.paintAt(x, y);
    // todo 考虑小程序getImageData兼容
    // const prevImageData = pixelPainter.getImageData(x, y);
    const imageData = pixelPainter.getImageData(0, 0, 1, 1);
    const pickValue = imageData.data;
    const r0 = pickValue[0];
    const g0 = pickValue[1];
    const b0 = pickValue[2];
    let target: Element;
    for (let i = 0; i < leafNodes.length; i++) {
      const node = leafNodes[i];
      const [r, g, b] = node.pickRGB;
      const gap = Math.abs(r - r0) + Math.abs(g - g0) + Math.abs(b - b0);
      if (gap < 3) {
        target = node;
        break;
      }
    }
    if (target) {
      target.setAttr({ fill: 'red', stroke: 'red', });
    }
    console.timeEnd('pick');
    return target || this.render.getRoot();
  }

  public dispose() {
    if (this.render.isBrowser()) {
      this._detachEvents();
    }
  }

  public setCurosr(item: Element) {
    const cursor = item.getExtendAttr('cursor');
    this.render.getDom().style.cursor = cursor;
  }

  private _detachEvents() {
    if (!this.render.isBrowser()) {
      return;
    }
    const dom = this.render.getDom();
    dom.removeEventListener('wheel', this._handleMouseWheel);
    dom.removeEventListener('mousedown', this._handleMouseDown);
    dom.removeEventListener('mouseup', this._handleMouseUp);
    dom.removeEventListener('mousemove', this._handleMouseMove);
    dom.removeEventListener('click', this._handleClick);
    dom.removeEventListener('dblclick', this._handleDblClick);
    dom.removeEventListener('touchstart', this._handleTouchStart);
    dom.removeEventListener('touchmove', this._handleTouchMove);
    dom.removeEventListener('touchend', this._handleTouchEnd);
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
    dom.addEventListener('wheel', this._handleMouseWheel);
    dom.addEventListener('mousedown', this._handleMouseDown);
    dom.addEventListener('mouseup', this._handleMouseUp);
    dom.addEventListener('mousemove', this._handleMouseMove);
    dom.addEventListener('click', this._handleClick);
    dom.addEventListener('dblclick', this._handleDblClick);
    dom.addEventListener('touchstart', this._handleTouchStart);
    dom.addEventListener('touchmove', this._handleTouchMove);
    dom.addEventListener('touchend', this._handleTouchEnd);
    dom.addEventListener('mouseleave', this._handleMouseLeave);
    dom.addEventListener('mouseenter', this._handleMouseEnter);
    document.addEventListener('touchend', this._handleDocumentTouchEnd);
    document.addEventListener('mouseup', this._handleDocumentMouseUp);
  }

  private _handleMouseWheel = (event: WheelEvent) => {
    // todo https://github.com/facebookarchive/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
  };

  private _handleMouseDown = (event: MouseEvent) => {
    // todo
  };

  private _handleMouseUp = (event: MouseEvent) => {
    // todo
  };

  private _handleMouseMove = (event: MouseEvent) => {
    return
    this._currentMousePosition = { x: event.offsetX, y: event.offsetY };
    const target = this.pickTarget(event.offsetX, event.offsetY);
    this.setCurosr(target);
  };

  private _handleClick = (event: WheelEvent) => {
    this.pickTarget(event.offsetX, event.offsetY);
  };

  private _handleDblClick = (event: WheelEvent) => {
    // todo
  };

  private _handleTouchStart = (event: WheelEvent) => {
    // todo
  };

  private _handleTouchMove = (event: WheelEvent) => {
    // todo
  };

  private _handleTouchEnd = (event: WheelEvent) => {
    // todo
  };

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
}
