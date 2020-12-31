import Shape from './Shape'
import  {CommonAttr, } from './Element'

export interface RectConf extends CommonAttr {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  // todo rect r support
}

export default class Rect extends Shape<RectConf> {
  public type = 'line';

  public brush(ctx: CanvasRenderingContext2D) {
    const {x, y, width, height, } = this.attr;
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
  }
  
}