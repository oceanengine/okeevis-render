import Painter from './painter/Painter';
import CanvasPainter from './painter/CanvasPainter';
import EventFul from './utils/Eventful';
import Group from './shapes/Group';
import Element from './shapes/Element';
import requestAnimationFrame from './utils/requestAnimationFrame';

export default class Render extends EventFul {
  private _dom: HTMLDivElement
  private _dpr: number;
  private _width: number;
  private _height: number;
  private _painter: Painter;
  // private _eventHandle
  // private _animator
  private _renderer: 'canvas' | 'svg';
  private _isBrowser: boolean;
  private _requestAnimationFrameId: number;
  private _root: Group = new Group();

  public constructor(dom: HTMLDivElement | HTMLCanvasElement) {
    super();
    this._painter= new CanvasPainter(this);
    this._loop();
  }

  public resize(width: number, height: number) {
    this._width = width;
    this._height = height;
    this._painter.resize(width, height);
  }

  
  public updateAll() {

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

  public getBase64() {

  }

  public downloadImage() {

    
  }

  public dispose() {
    // todo polyfill
    cancelAnimationFrame(this._requestAnimationFrameId);
  }
  
  public getAllElements(): Element[] {
    return this._root.children();
  }

  private _onFrame = (now: number) => {
    this._painter.onFrame(now);
    requestAnimationFrame(this._onFrame)
  }

  private _loop() {
    this._requestAnimationFrameId = requestAnimationFrame(this._onFrame);
  }
  
}