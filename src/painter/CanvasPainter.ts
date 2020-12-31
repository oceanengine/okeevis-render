
import Painter from './Painter';
import Render from '../render';
import Element, {CommonAttr, } from '../shapes/Element';
import Shape from '../shapes/Shape';
import Group from '../shapes/Group';
import * as lodash from '../utils/lodash';

export interface RenderingContext extends CommonAttr {

}

export default class CanvasPainter  implements Painter {
  
  public render: Render;

  private _canvas: HTMLCanvasElement;
  private _width: number;
  private _height: number;

  public constructor(render: Render) {
    this.render = render;
    this._initCanvas();
  }

  public resize(width: number, height: number) {
    // todo dpr
    this._width =  this._canvas.width = width;
    this._height = this._canvas.height = height;
    this.paint();
  }

  public onFrame() {
    this.paint();
  }

  public paint() {
    if (!this.render.needUpdate()) {
      return;
    }
    console.time('paint');
    const ctx = this._canvas.getContext('2d');
    const elements = this.render.getAllElements();
    ctx.clearRect(0, 0, this._width, this._height);
    const dpr = this.render.dpr || 1;
    ctx.save();
    if (dpr !== 1) {
      ctx.scale(dpr, dpr);
    }
    const contextStack: RenderingContext[] = [];
    elements.forEach(item => this.drawElement(ctx, item, contextStack));
    ctx.restore();
    console.timeEnd('paint');
  }

  public drawElement(ctx: CanvasRenderingContext2D, item: Element, contextStack: RenderingContext[]) {
    const attr = item.attr;
    const prevContext = lodash.last(contextStack);
    const changedContext = this._getChangedContext(prevContext, item.attr);
    if (item.type !== 'group') {
      const current = item as Shape;
      ctx.lineWidth = attr.lineWidth;
      ctx.strokeStyle = attr.stroke;
      ctx.fillStyle = attr.fill;
      ctx.beginPath();
      current.brush(ctx);
      ctx.fill();
      ctx.stroke();
    } else {
      const current = item as Group;
      current.children().forEach(child => this.drawElement(ctx, child, contextStack));
    }
  }
  
  public initElementContext() {

  }

  public dispose() {
    
  }

  private _initCanvas() {
    const render = this.render;
    const dom = render.getDom();
    const width = render.getWidth();
    const height = render.getHeight();
    // todo dpr
    const dpr = this.render.dpr || 1;
    if (typeof (dom as HTMLCanvasElement).getContext === 'function') {
      this._canvas = dom as HTMLCanvasElement;
    } else {
      const canvas = document.createElement('canvas');
      canvas.width =  width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      this._canvas = canvas;
      render.getDom().appendChild(canvas);
    }
    this._width = width;
    this._height = height;
  }

  private _getChangedContext(prevContext: RenderingContext, currentContext: RenderingContext): Array<keyof RenderingContext> {
    return ['fill', 'fillOpacity'];
  }
  
}