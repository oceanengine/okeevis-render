
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
  }

  public resize(width: number, height: number) {
    this._width =  this._canvas.width = width;
    this._height = this._canvas.height = height;
    this.paint();
  }

  public onFrame() {
    console.time('paint');
    this.paint();
    console.timeEnd('paint');
  }

  public paint() {
    const ctx = this._canvas.getContext('2d');
    const elements = this.render.getAllElements();
    ctx.clearRect(0, 0, this._width, this._height);
    const contextStack: RenderingContext[] = []
    elements.forEach(item => this.drawElement(ctx, item, contextStack));
  }

  public drawElement(ctx: CanvasRenderingContext2D, item: Element, contextStack: RenderingContext[]) {
    const attr = item.attr;
    const prevContext = lodash.last(contextStack);
    const changedContext = this._getChangedContext(prevContext, item.attr);
    if (item.type !== 'group') {
      ctx.lineWidth = attr.lineWidth;
      ctx.fill = attr.fill;
      const current = item as Shape;
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

  private _getChangedContext(prevContext: RenderingContext, currentContext: RenderingContext): Array<keyof RenderingContext> {
    return ['fill', 'fillOpacity'];
  }
  
}