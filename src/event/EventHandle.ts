import Render from '../render';
import Element from '../shapes/Element';

export interface CompositeEvent<T> {
  type: string;
  original: T;
  readonly detail?: any;
  readonly stopped: boolean;
  readonly bubble: boolean;
  stopPropagation: () => void;
}

export interface CompositeMouseEvent extends CompositeEvent<MouseEvent> {
  x: number;
  y: number;
  target: Element;
}

export interface CompositeTouch {
  readonly identifier: number;
  x: number;
  y: number;
  target: Element;
}

export interface CompositeTouchEvent extends CompositeEvent<TouchEvent> {
  touches: CompositeTouch[];
  changedTouches: CompositeTouch[];
}

export default class EventHandle  {
  public render: Render;

  private _currentMousePosition: {x: number, y: number};

  private _draggingTarget: Element;

  private _prevMouseTarget: Element;

  private _prevTouchTarget: Record<number, Element>;

  public constructor(render: Render) {
    this.render = render;
    this._initEvents();
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
  }

  private _handleMouseDown = (event: WheelEvent) => {
    // todo
  }

  private _handleMouseUp = (event: WheelEvent) => {
    // todo
  }

  private _handleMouseMove = (event: WheelEvent) => {
    // todo
  }

  private _handleClick= (event: WheelEvent) => {
    // todo
    console.log('click')
  }

  private _handleDblClick= (event: WheelEvent) => {
    // todo
  }

  private _handleTouchStart= (event: WheelEvent) => {
    // todo
  }

  private _handleTouchMove= (event: WheelEvent) => {
    // todo
  }

  private _handleTouchEnd= (event: WheelEvent) => {
    // todo
  }

  private _handleMouseLeave= (event: WheelEvent) => {
    // todo
  }

  private _handleMouseEnter= (event: WheelEvent) => {
    // todo
  }

  private _handleDocumentTouchEnd = (event: MouseEvent) => {
    // todo
  }

  private _handleDocumentMouseUp = (event: MouseEvent) => {
    // todo
  }
}
