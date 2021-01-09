import Render from '../render';
import PixelPainter from '../painter/PixelPainter';
import Element from '../shapes/Element';

export default class EventHandle {
  public render: Render;

  private _currentMousePosition: { x: number; y: number };

  private _draggingTarget: Element;

  private _prevMouseTarget: Element;

  private _prevTouchTarget: Record<number, Element>;

  private _PixelPainter: PixelPainter;

  public constructor(render: Render) {
    this.render = render;
    this._PixelPainter = new PixelPainter(render);
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

  public pickTarget(x: number, y: number) {
    console.time('pick');
    const pixelPainter = this._PixelPainter;
    const leafNodes = this.render.getAllLeafNodes();
    // https://www.yuque.com/antv/ou292n/okxrus
    leafNodes.forEach((item, index) => {
      item.colorId = index * 1000;
    });
    pixelPainter.paintAt(x, y);
    // todo 考虑小程序getImageData兼容
    // const prevImageData = pixelPainter.getImageData(x, y);
    const imageData = pixelPainter.getImageData(0, 0, 1, 1);
    console.timeEnd('pick');
  }

  public dispose() {
    if (this.render.isBrowser()) {
      this._detachEvents();
    }
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
    this._currentMousePosition = { x: event.offsetX, y: event.offsetY };
    this.pickTarget(event.offsetX, event.offsetY);
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
