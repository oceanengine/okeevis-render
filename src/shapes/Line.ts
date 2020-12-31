import Shape from './Shape'
import  {CommonAttr, } from './Element'

export interface LineConf extends CommonAttr {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

export default class Line extends Shape<LineConf> {
  public type = 'line';

  public brush(ctx: CanvasRenderingContext2D) {
    ctx.moveTo(this.attr.x1, this.attr.y1);
    ctx.lineTo(this.attr.x2, this.attr.y2);
  }
  
}