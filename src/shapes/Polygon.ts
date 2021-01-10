import Polyline, { PolylineConf } from './Polyline';

export type PolygonConf = PolylineConf;


export default class Polygon extends Polyline {
  public type = 'polygon';

  public brush(ctx: CanvasRenderingContext2D) {
    super.brush(ctx);
    ctx.closePath();
  }  
}
