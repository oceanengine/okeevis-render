import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox, polygonBBox } from '../utils/bbox';
import { pointInPolygonFill, pointInPolygonStroke } from '../geometry/contain/polygon';
import { getPolylineCornerRadiusPoints } from '../geometry/cornerRadius';
import { Curve, MonotoneX, MonotoneY, CatmullRomClosed, Natural} from '../geometry/curve';
interface Point {
  x: number;
  y: number;
}
export interface PolylineAttr extends CommonAttr {
  pointList?: Point[];
  borderRadius?: number | number[];
  smooth?: boolean;
  smoothMonotone?: 'x' | 'y';
}
const shapeKeys: Array<keyof PolylineAttr> = [
  'pointList',
  'smooth',
  'smoothMonotone',
];

export default class Polyline extends Shape<PolylineAttr> {
  public type = 'polyline';

  public shapeKeys = shapeKeys;

  public getDefaultAttr(): PolylineAttr {
    return {
      ...super.getDefaultAttr(),
      pointList: [],
      smooth: false,
    };
  }

  public getAnimationKeys(): Array<keyof PolylineAttr> {
    return [...super.getAnimationKeys(), 'pointList'];
  }

  public brush(ctx:CanvasRenderingContext2D) {
    const { pointList, smoothMonotone } = this.attr;
    const borderRadius = this.getExtendAttr('borderRadius') || 0;
    const isPolygon = this.type === 'polygon';
    if (!pointList || pointList.length === 0) {
      return;
    }
    if (this.attr.smooth) {
        let CurveUse: new(ctx: CanvasRenderingContext2D) => Curve;
        if (this.type === 'polygon') {
          CurveUse = CatmullRomClosed;
        } else {
          if (smoothMonotone === 'x') {
            CurveUse = MonotoneX;
          } else if (smoothMonotone === 'y') {
            CurveUse = MonotoneY;
          } else {
            CurveUse = Natural;
          }
        }
        let curve = new CurveUse(ctx);
        curve.lineStart();
        pointList.forEach(point => curve.point(point.x, point.y));
        curve.lineEnd();
    } else {
      ctx.moveTo(pointList[0].x, pointList[0].y);
      let radiusIndex = -1;
      for (let i: number = isPolygon ? 0 : 1; i < pointList.length; i++) {
        radiusIndex++;
        if (!borderRadius) {
          ctx.lineTo(pointList[i].x, pointList[i].y);
        } else {
          const r = Array.isArray(borderRadius) ? (borderRadius[radiusIndex] || 0) : borderRadius;
          let p1 = pointList[i - 1];
          const p2 = pointList[i];
          let p3 = pointList[i + 1];
          const isFirstPolygonPoint = !p1 && isPolygon;
          if (isFirstPolygonPoint) {
            p1 = pointList[pointList.length -1];
          }
          if (!p3 && isPolygon) {
            p3 = pointList[0];
          }
          this.lineToWithBorderRadius(ctx, p1, p2, p3, r, isFirstPolygonPoint);
        }
      }
    }
  }

  protected lineToWithBorderRadius(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, p3: Point, borderRadius: number, noLineTo: boolean) {
    if (!p3 && this.type === 'polyline') {
      return ctx.lineTo(p2.x, p2.y);
    }
    const { radius, startPoint, startAngle, endAngle, center, clocWise } = getPolylineCornerRadiusPoints([p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y], borderRadius);
    if (!noLineTo) {
      ctx.lineTo(startPoint[0], startPoint[1]);
    } else {
      ctx.moveTo(startPoint[0], startPoint[1]);
    }
    ctx.arc(center[0], center[1], radius, startAngle, endAngle, !clocWise);
  }

  protected computeBBox(): BBox {
    if (!this.attr.smooth) {
      return polygonBBox(this.attr.pointList);
    }
    return this.getPathData().getPathBBox();
  }

  public isPointInFill(x: number, y: number): boolean {
    const points = this.attr.pointList;
    return pointInPolygonFill(points, x, y);
  }

  public isPointInStroke(x: number, y: number, lineWidth: number): boolean {
    const points = this.attr.pointList;
    return pointInPolygonStroke(points, false, lineWidth, x, y);
  }

  public pickByGPU(): boolean {
    return this.attr.smooth;
  }
}
