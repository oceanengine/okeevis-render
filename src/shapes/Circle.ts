import Shape from './Shape'
import  {CommonAttr, } from './Element'

export interface CircleConf extends CommonAttr {
 cx?: number;
 cy?: number;
 radius?: number;
}

export default class Rect extends Shape<CircleConf> {
  public type = 'circle';

  public brush(ctx: CanvasRenderingContext2D) {
    const {cx, cy, radius} = this.attr;
    ctx.arc(
     cx,
     cy,
     radius,
     0,
     Math.PI * 2
  );
  }
  
}