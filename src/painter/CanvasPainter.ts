
import Painter from '../abstract/Painter';
import Render from '../render';
import Element, {CommonAttr, } from '../shapes/Element';
import Shape from '../shapes/Shape';
import Group from '../shapes/Group';
import * as lodash from '../utils/lodash';

const mat3 = require('gl-matrix/mat3');

export interface RenderingContext extends CommonAttr {

}
const identityMat3 = mat3.create();

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
    this._width =  this._canvas.width = width * this.render.dpr;
    this._height = this._canvas.height = height * this.render.dpr;
    this.paint(true);
  }

  public onFrame() {
    this.paint();
  }

  public paint(forceUpdate: boolean= false) {
    if (!this.render.needUpdate() && !forceUpdate) {
      return;
    }
    console.time('paint');
    const ctx = this._canvas.getContext('2d');
    const elements = this.render.getAllElements();
    ctx.clearRect(0, 0, this._width, this._height);
    const dpr = this.render.dpr;
    ctx.save();
    if (dpr !== 1) {
      ctx.scale(dpr,  dpr);
    }
    const contextStack: RenderingContext[] = [];
    elements.forEach(item => this.drawElement(ctx, item, contextStack));
    ctx.restore();
    console.timeEnd('paint');
  }

  public drawElement(ctx: CanvasRenderingContext2D, item: Element, contextStack: RenderingContext[]) {
    const attr = item.attr;
    if (attr.display === false) {
      return;
    }
    ctx.save();
    const matrix3 = item.getTransform();
    if (!mat3.equals(matrix3, identityMat3)) {
      ctx.transform(matrix3[0], matrix3[1], matrix3[3], matrix3[4], matrix3[6], matrix3[7]);
    }
    
    if ((item as Shape).attr.clip) {
      ctx.beginPath();
      (item as Shape).attr.clip.brush(ctx);
      ctx.clip();
    }

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
    ctx.restore();
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
    const dpr = this.render.dpr;
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
  
}