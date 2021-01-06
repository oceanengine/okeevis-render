import Painter from './abstract/Painter';
import CanvasPainter from './painter/CanvasPainter';
import EventHandle from './event/EventHandle';
import EventFul from './utils/Eventful';
import Group from './shapes/Group';
import Element from './shapes/Element';
import {getDomContentSize, } from './utils/dom';
import requestAnimationFrame from './utils/requestAnimationFrame';

export interface RenderOptions {
  dpr?: number;
}

export default class Render extends EventFul {
  public dpr: number = 1;

  private _dom: HTMLDivElement | HTMLCanvasElement;

  private _width: number;

  private _height: number;

  private _renderer: 'canvas' | 'svg';

  private _isBrowser: boolean;

  private _needUpdate: boolean = true;

  private _requestAnimationFrameId: number;
  
  private _root: Group;

  private _painter: Painter;

  private _eventHandle: EventHandle;
  
  public constructor(dom: HTMLDivElement | HTMLCanvasElement, option: RenderOptions = {}) {
    super();
    this._dom = dom;
    if (typeof (dom as HTMLCanvasElement).getContext === 'function') {
      this._width =  (dom as HTMLCanvasElement).width;
      this._height = (dom as HTMLCanvasElement).height;
    } else {
      const[width, height] = getDomContentSize(dom);
      this._width = width;
      this._height = height;
    }
    this._root = new Group();
    this._root.renderer = this;
    this._isBrowser =   /html.*?element/gi.test(Object.prototype.toString.call(dom));
    this.dpr = option.dpr || (this._isBrowser ? window.devicePixelRatio : 1);
    this._painter= new CanvasPainter(this);
    this._eventHandle = new EventHandle(this);
    this._loop();
  }

  public resize(width: number, height: number) {
    this._width = width;
    this._height = height;
    this._painter.resize(width, height);
  }

  public dirty() {
    this._needUpdate = true;
  }

  public getWidth(): number {
    return this._width;
  }

  public getHeight(): number {
    return this._height;
  }

  public add(element: Element) {
    this._root.add(element);
  }

  public addAll(elements: Element[]) {
    this._root.addAll(elements);
  }

  public remove(element: Element) {
    this._root.remove(element);
  }

  public updateAll(elements: Element[]) {
    this._root.updateChildren(elements);
  }

  public getDom(): HTMLDivElement | HTMLCanvasElement {
    return this._dom;
  }

  public getBase64() {

  }

  public downloadImage() {

    
  }

  public needUpdate(): boolean {
    return this._needUpdate;
  }

  public dispose() {
    // todo polyfill
    cancelAnimationFrame(this._requestAnimationFrameId);
    this._eventHandle.dispose();
    this._painter.dispose();
  }
  
  public getAllElements(): Element[] {
    return this._root.children();
  }

  public isBrowser() {
    return this._isBrowser;
  }

  private _onFrame = (now: number) => {
    this._root.onFrame(now);
    this._painter.onFrame(now);
    this._needUpdate = false;
    requestAnimationFrame(this._onFrame)
  }

  private _loop() {
    this._requestAnimationFrameId = requestAnimationFrame(this._onFrame);
  }
  
}