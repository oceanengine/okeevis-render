import * as ES6Set from 'es6-set';
import Painter from './abstract/Painter';
import EventHandle from './event/EventHandle';
import EventFul from './utils/Eventful';
import Group, { ChunkItem } from './shapes/Group';
import Element from './shapes/Element';
import { getDomContentSize } from './utils/dom';
import { requestAnimationFrame, cancelAnimationFrame } from './utils/rAF';
import { addContext, removeContext } from './utils/measureText';
import { getPainter } from './painter';
import { renderToSVGString } from './svg/renderToSVGString';
import { downloadBase64 } from './utils/download';

import './painter/CanvasPainter';
import './painter/SVGPainter';

export interface RenderOptions {
  dpr?: number;
  renderer?: 'canvas' | 'svg';
  width?: number;
  height?: number;
}

export default class Render extends EventFul {
  public dpr: number = 1;

  public enableDirtyRect: boolean = true;

  public maxDirtyRects: number = 128;

  // public showDirtyRect: boolean = false;

  public showBoundingRect: boolean = false;

  public showBBox: boolean = false;

  public showFPS: boolean = false;

  public scaleByDprBeforePaint: boolean = true;

  public eventListener: Function;

  private _dom: HTMLDivElement | HTMLCanvasElement;

  private _width: number;

  private _height: number;

  private _renderer: 'canvas' | 'svg';

  private _isBrowser: boolean;

  private _needUpdate: boolean = true;

  private _requestAnimationFrameId: number;

  private _rootGroup: Group;

  private _eventGroop: Group = new Group();

  private _dirtyElements: ES6Set<Element> = new ES6Set();

  private _painter: Painter;

  private _eventHandle: EventHandle;

  private _eventElementHandle: EventHandle;

  private _disposed: boolean = false;

  private _isOnframe: boolean = false;

  public constructor(dom?: HTMLDivElement | HTMLCanvasElement, option: RenderOptions = {}) {
    super();

    this._rootGroup = new Group();
    this._rootGroup.ownerRender = this;
    this._isBrowser = /html.*?element/gi.test(Object.prototype.toString.call(dom));
    this.dpr = option.dpr || (this._isBrowser ? window.devicePixelRatio || 1 : 1);
    this._renderer = option.renderer || 'canvas';
    this._dom = dom;
    if (dom) {
      if (typeof (dom as HTMLCanvasElement).getContext === 'function') {
        this._width = (dom as HTMLCanvasElement).width;
        this._height = (dom as HTMLCanvasElement).height;
      } else {
        const [width, height] = getDomContentSize(dom);
        this._width = width;
        this._height = height;
      }
      const UsedPainter = getPainter(this._renderer);
      this._painter = new UsedPainter(this);
      addContext(this._painter.getContext());
    } else {
      this._width = option.width || 300;
      this._height = option.height || 150;
    }
    this._eventHandle = new EventHandle(this);
    this._eventElementHandle = new EventHandle(this, true)
    this._loop();
  }

  public resize(width: number, height: number) {
    this._width = width;
    this._height = height;
    this._painter?.resize(width, height);
  }

  public refresh() {
    this.dirty();
  }

  public refreshImmediately() {
    this.dirty();
    this._onFrame();
  }

  public dirty(el?: Element<any>) {
    this._needUpdate = true;
    // todo svg下不能限制dirtyElements数量
    if (el && this._renderer === 'svg') {
      this._dirtyElements.add(el);
      return;
    }
    if (el && el.isClip) {
      this._rootGroup.dirtyClipTarget(el);
      return;
    }
    if (el && this.enableDirtyRect && this._dirtyElements.size <= this.maxDirtyRects) {
      this._dirtyElements.add(el);
    }
  }

  public getWidth(): number {
    return this._width;
  }

  public getHeight(): number {
    return this._height;
  }

  public get renderer(): 'canvas' | 'svg' {
    return this._renderer;
  }

  public prepend(element: Element) {
    this._rootGroup.prepend(element);
  }

  public add(element: Element) {
    this._rootGroup.add(element);
  }

  public addAll(elements: Element[]) {
    this._rootGroup.addAll(elements);
  }

  public remove(element: Element) {
    this._rootGroup.remove(element);
  }

  public clear() {
    this._rootGroup.clear();
  }

  public updateAll(elements: Element[]) {
    this._rootGroup.updateAll(elements);
  }

  public addEventElement(element: Element) {
    this._eventGroop.add(element);
  }

  public removeEventElement(element: Element) {
    this._eventGroop.remove(element);
  }

  public getDom(): HTMLDivElement | HTMLCanvasElement {
    return this._dom;
  }

  public getRoot(): Group {
    return this._rootGroup;
  }

  public getEventGroup() {
    return this._eventGroop;
  }

  public getDirtyElements(): ES6Set<Element> {
    return this._dirtyElements;
  }

  public downloadImage(name: string): void {
    const base64: string = this.getPainter().getBase64();
    downloadBase64(base64, name);
  }

  public needUpdate(): boolean {
    return this._needUpdate;
  }

  public dispose() {
    // todo polyfill
    cancelAnimationFrame(this._requestAnimationFrameId);
    if (this._painter) {
      removeContext(this._painter.getContext());
      this._painter.dispose();
    }
    this.removeAllListeners();
    this._eventHandle.dispose();
    this._eventElementHandle.dispose();
    this._rootGroup.clear();
    this._eventGroop.clear();
    this._rootGroup = null;
    this._dom = undefined;
    this._disposed = true;
  }

  public getAllChunks(): ChunkItem[] {
    return this._rootGroup.getAllChunks();
  }

  public isBrowser() {
    return this._isBrowser;
  }

  public getPainter(): Painter {
    return this._painter;
  }

  public renderToSVGString(): string {
    return renderToSVGString(this.getRoot(), this._width, this._height);
  }

  public getEventHandle(): EventHandle {
    return this._eventHandle;
  }

  protected onEvent(type: string, ...params: any[]) {
   if (this.eventListener) {
     this.eventListener.call(null, type, params);
   }
  }

  private _onFrame = (now?: number) => {
    if (this._disposed || this._isOnframe) {
      return;
    }
    this._isOnframe = true;
    this._rootGroup.onFrame(now);
    this._painter?.onFrame(now);
    this._eventHandle.onFrame();
    this._eventElementHandle.onFrame();
    this._needUpdate = false;
    this._dirtyElements.clear();
    const currentTime =
      typeof window !== 'undefined' && window.performance && window.performance.now
        ? window.performance.now()
        : Date.now();
    const timeRemaining = 16 - (currentTime - now);
    if (timeRemaining > 5) {
      this._rootGroup.getBoundingClientRect();
    }
    requestAnimationFrame(this._onFrame);
    this._isOnframe = false;
  };

  private _loop() {
    this._requestAnimationFrameId = requestAnimationFrame(this._onFrame);
  }
}
