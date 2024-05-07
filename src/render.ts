import ES6Set from './utils/set';
import Painter from './abstract/Painter';
import EventHandle from './event/EventHandle';
import EventFul from './utils/Eventful';
import type { RenderEventHandleParam } from './event/index';
import Group from './shapes/Group';
import Element from './shapes/Element';
import { getRequestAnimationFrame, getCancelAnimationFrame } from './utils/rAF';
import { addContext, removeContext } from './utils/measureText';
import { getPainter, registerPainter } from './painter';
import CanvasPainter from './painter/CanvasPainter';
import SVGPainter from './painter/SVGPainter';
import { renderToSVGString } from './svg/renderToSVGString';
import { downloadBase64 } from './utils/download';
import { getDomContentSize } from './utils/dom';
import type { CommandBufferEncoder } from './multi-thread/command-buffer';
import { BBox } from './utils/bbox';
import { getFeature } from './utils/featureManager';

registerPainter('canvas', CanvasPainter);
registerPainter('svg', SVGPainter);

export interface RenderOptions {
  dpr?: number;
  renderer?: 'canvas' | 'svg';
  width?: number;
  height?: number;
  workerEnabled?: boolean;
}

export default class Render extends EventFul<RenderEventHandleParam> {
  public dpr: number = 1;

  public enableDirtyRect: boolean = true;

  public autoDpr = true;

  public maxDirtyRects: number = 128;

  // public showDirtyRect: boolean = false;
  public simulateClickEvent: boolean = false;

  public showBoundingRect: boolean = false;

  public showBBox: boolean = false;

  public showFPS: boolean = false;

  public scaleByDprBeforePaint: boolean = true;

  public enableViewportCulling: boolean = false;

  public eventListener: Function;

  public chunksElement: ES6Set<Group> = new ES6Set();

  private _dom: HTMLElement;

  private _width: number;

  private _height: number;

  private _renderer: 'canvas' | 'svg';

  private _isBrowser: boolean;

  private _needUpdate: boolean = true;

  private _requestAnimationFrameId: number;

  private _rootGroup: Group;

  private _eventGroop: Group = new Group();

  private _dirtyElements: ES6Set<Element> = new ES6Set();

  private _frameAbleElement: ES6Set<Element> = new ES6Set();

  private _painter: Painter;

  private _eventHandle: EventHandle;

  private _eventElementHandle: EventHandle;

  private _disposed: boolean = false;

  private _isOnframe: boolean = false;

  private _raf: Function;

  private _caf: Function;

  private _unregisterWorker: Function;

  private _workerEnabled: boolean;

  private _commandBuffer: CommandBufferEncoder;

  private _effectPending: boolean = false;

  private _hookElementEffects: Function[] = [];

  public constructor(dom?: HTMLElement, option: RenderOptions = {}) {
    super();

    this._rootGroup = new Group();
    this._rootGroup.ownerRender = this;
    this._isBrowser = /html.*?element/gi.test(Object.prototype.toString.call(dom));
    this.dpr = option.dpr || (this._isBrowser ? window.devicePixelRatio || 1 : 1);
    this.autoDpr = !option.dpr;
    this._renderer = option.renderer || 'canvas';
    this._workerEnabled = option.workerEnabled;
    this._dom = dom;
    if (dom) {
      let domWidth: number;
      let domHeight: number;
      if (typeof (dom as HTMLCanvasElement).getContext === 'function' && !this._isBrowser) {
        domWidth = (dom as HTMLCanvasElement).width;
        domHeight = (dom as HTMLCanvasElement).height;
      } else {
        const [divWidth, divHeight] = getDomContentSize(dom as HTMLDivElement);
        domWidth = divWidth;
        domHeight = divHeight;
      }
      const { width = domWidth, height = domHeight } = option;
      this._width = width;
      this._height = height;
      const UsedPainter = getPainter(this._renderer) || CanvasPainter;
      if (UsedPainter === CanvasPainter) {
        this._renderer = 'canvas';
      }
      this._painter = new UsedPainter(this);
      addContext(this._painter.getContext());
    } else {
      this._width = option.width || 300;
      this._height = option.height || 150;
    }
    this._eventHandle = new EventHandle(this);
    this._eventElementHandle = new EventHandle(this, true);
    if (
      this._workerEnabled &&
      this.renderer === 'canvas' &&
      this._isBrowser &&
      window.OffscreenCanvas &&
      getFeature('worker')
    ) {
      const {
        requestAnimationFrame: raf,
        cancelAnimationFrame: caf,
        unRegisterTask,
        commandBuffer,
      } = getFeature('worker')().getRaf({
        onPainted: this._onThreadPaited,
      });
      this._raf = raf;
      this._caf = caf;
      this._unregisterWorker = unRegisterTask;
      this._commandBuffer = commandBuffer;
      (this._painter as CanvasPainter).setContext(commandBuffer as any);
    } else {
      this._workerEnabled = false;
      this._raf = getRequestAnimationFrame();
      this._caf = getCancelAnimationFrame();
    }
    this.nextTick();
  }

  public resize(width: number, height: number) {
    this._width = width;
    this._height = height;
    this._painter?.resize(width, height);
    this.dispatch('resize');
  }

  public getRaf(): typeof requestAnimationFrame {
    return this._raf as typeof requestAnimationFrame;
  }

  public isWorkerEnabled(): boolean {
    return this._workerEnabled;
  }

  public refresh() {
    this._needUpdate = true;
    this.nextTick();
  }

  public refreshImmediately() {
    this._needUpdate = true;
    this._onFrame();
  }

  public dirty(el?: Element<any>) {
    this.nextTick();
    this._needUpdate = true;
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

  public updateAll(elements: Element<any>[], transition: boolean = true) {
    this.chunksElement.clear();
    this._frameAbleElement.clear();
    this._rootGroup.updateAll(elements, transition);
  }

  public addEventElement(element: Element) {
    this._eventGroop.add(element);
  }

  public removeEventElement(element: Element) {
    this._eventGroop.remove(element);
  }

  public getDom(): HTMLElement {
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
    this._caf(this._requestAnimationFrameId);
    if (this._workerEnabled) {
      this._unregisterWorker();
    }
    if (this._painter) {
      removeContext(this._painter.getContext());
      this._painter.dispose();
    }
    this.removeAllListeners();
    this._eventHandle.dispose();
    this._eventElementHandle.dispose();
    this._frameAbleElement.clear();
    this.chunksElement.clear();
    this._rootGroup.clear();
    this._eventGroop.clear();
    this._rootGroup = null;
    this._dom = undefined;
    this._disposed = true;
  }

  public isBrowser() {
    return this._isBrowser;
  }

  public getPainter(): Painter {
    return this._painter;
  }

  public renderToSVGString(option: { figma?: boolean } = {}): string {
    return renderToSVGString(this.getRoot(), this._width, this._height, option.figma);
  }

  public syntheticEvent(type: string, param: any) {
    this._eventHandle.dispatch(type, param);
    this._eventElementHandle.dispatch(type, param);
  }

  public getEventHandle(): EventHandle {
    return this._eventHandle;
  }

  public __addFrameableElement(element: Element<any>) {
    this._frameAbleElement.add(element);
    this.nextTick();
  }

  public __removeFrameableElement(element: Element<any>) {
    this._frameAbleElement.delete(element);
  }

  public __pushPendingEffect(effect: Function) {
    this._hookElementEffects.unshift(effect);
    if (!this._effectPending) {
      this._effectPending = true;
      this.getRaf()(() => {
        this._hookElementEffects.forEach(effect => effect());
        this._effectPending = false;
        this._hookElementEffects.length = 0;
      })
    }
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
    this._requestAnimationFrameId = null;
    this._isOnframe = true;
    this._frameAbleElement.forEach(item => item.onFrame(now));
    this._eventHandle.onFrame();
    this._eventElementHandle.onFrame();

    if (this._workerEnabled) {
      const canvas = (this._painter as CanvasPainter).getCanvas();
      this._commandBuffer.start(canvas.width, canvas.height);
    }
    this._painter?.onFrame(now);
    if (this._workerEnabled) {
      this._commandBuffer.commit();
    }

    this._needUpdate = false;
    this._dirtyElements.clear();
    const chunkSize = this.chunksElement.size;
    const frameAbleSize = this._frameAbleElement.size;
    if (chunkSize === 0 && frameAbleSize === 0) {
      const currentTime =
        typeof window !== 'undefined' && window.performance && window.performance.now
          ? window.performance.now()
          : Date.now();
      const timeRemaining = 16 - (currentTime - now);
      if (timeRemaining > 5) {
        this._rootGroup.getBoundingClientRect();
      }
    }
    this._isOnframe = false;
    if (frameAbleSize > 0 || chunkSize > 0) {
      this.nextTick();
    }
  };

  public nextTick() {
    if (!this._requestAnimationFrameId) {
      this._requestAnimationFrameId = this._raf(this._onFrame);
    }
  }

  public getOneChunk(): { parent: Group; items: Element[] } {
    let parent: Group;
    let items: Element[];
    if (!this.chunksElement.size) {
      return;
    }
    this.chunksElement.forEach(group => {
      if (!parent) {
        parent = group;
        items = group.getChunks()[0];
      }
    });
    return {
      parent,
      items,
    };
  }

  private _onThreadPaited = (data: ImageBitmap, clearRects: BBox[]) => {
    const painter = this._painter as CanvasPainter;
    const ctx = painter.getCanvasContext();
    clearRects.forEach(rect => ctx.clearRect(rect.x, rect.y, rect.width, rect.height));
    ctx.drawImage(data, 0, 0, data.width, data.height);
  };
}
