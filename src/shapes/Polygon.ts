import Polyline, { PolylineConf } from './Polyline';
import { pointInPolygonStroke } from '../geometry/contain/polygon';

export type PolygonConf = PolylineConf;

export default class Polygon extends Polyline {
  public type = 'polygon';

  public pickByGPU = true;

  public brush(ctx: CanvasRenderingContext2D) {
    super.brush(ctx);
    ctx.closePath();
  }

  public isPointInStroke(x: number, y: number, lineWidth: number): boolean {
    const points = this.attr.pointList;
    return pointInPolygonStroke(points, true, lineWidth, x, y);
  }
}
