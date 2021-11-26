import Polyline, { PolylineAttr } from './Polyline';
import { pointInPolygonStroke } from '../geometry/contain/polygon';

export type PolygonAttr = PolylineAttr;

export default class Polygon extends Polyline {
  public type = 'polygon';

  public brush(ctx: CanvasRenderingContext2D) {
    super.brush(ctx);
    ctx.closePath();
  }

  public isPointInStroke(x: number, y: number, lineWidth: number): boolean {
    const points = this.attr.pointList;
    return pointInPolygonStroke(points, true, lineWidth, x, y);
  }
}
