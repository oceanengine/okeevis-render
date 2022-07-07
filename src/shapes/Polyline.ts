import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox, polygonBBox } from '../utils/bbox';
import { pointInPolygonFill, pointInPolygonStroke } from '../geometry/contain/polygon';
import bezierSmooth from '../geometry/bezier-smooth';
import catmullRom from '../geometry/catmull-rom';
import { getPolylineCornerRadiusPoints } from '../geometry/cornerRadius';
interface Point {
  x: number;
  y: number;
}
export interface PolylineAttr extends CommonAttr {
  pointList?: Point[];
  borderRadius?: number | number[];
  smooth?: boolean;
  smoothType?: 'bezier' | 'spline';
  smoothConstraint?: [Point, Point];
  smoothMonotone?: 'x' | 'y';
}
const shapeKeys: Array<keyof PolylineAttr> = [
  'pointList',
  'smooth',
  'smoothConstraint',
  'smoothMonotone',
  'smoothType',
];

export default class Polyline extends Shape<PolylineAttr> {
  public type = 'polyline';

  public shapeKeys = shapeKeys;

  public getDefaultAttr(): PolylineAttr {
    return {
      ...super.getDefaultAttr(),
      pointList: [],
      smooth: false,
      borderRadius: 0,
      smoothType: 'spline',
    };
  }

  public getAnimationKeys(): Array<keyof PolylineAttr> {
    return [...super.getAnimationKeys(), 'pointList'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const { pointList, borderRadius } = this.attr;
    const isPolygon = this.type === 'polygon';
    if (!pointList || pointList.length === 0) {
      return;
    }
    ctx.moveTo(pointList[0].x, pointList[0].y);
    if (this.attr.smooth && this.attr.smoothType === 'bezier') {
      const smoothList = bezierSmooth(
        pointList,
        this.type === 'polygon',
        this.attr.smoothConstraint,
        this.attr.smoothMonotone,
      );
      const pL: Point[][] = smoothList;
      for (let j: number = 0; j < pL.length; j++) {
        const i: Point[] = pL[j];
        ctx.bezierCurveTo(i[1].x, i[1].y, i[2].x, i[2].y, i[3].x, i[3].y);
      }
    } else if (this.attr.smooth && this.attr.smoothType === 'spline') {
      const splinePoints = catmullRom(pointList, false, 100);
      for (let i: number = 1; i < splinePoints.length; i++) {
        ctx.lineTo(splinePoints[i].x, splinePoints[i].y);
      }
    } else {
      for (let i: number = isPolygon ? 0 : 1; i < pointList.length; i++) {
        if (!borderRadius) {
          ctx.lineTo(pointList[i].x, pointList[i].y);
        } else {
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
          this.lineToWithBorderRadius(ctx, p1, p2, p3, borderRadius as number, isFirstPolygonPoint);
        }
      }
    }
  }

  protected lineToWithBorderRadius(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, p3: Point, borderRadius: number, noLineTo: boolean) {
    if (!p3 && this.type === 'polyline') {
      return ctx.lineTo(p2.x, p2.y);
    }
    const { startPoint, endPoint, center, clocWise } = getPolylineCornerRadiusPoints([p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y], borderRadius);
    if (!noLineTo) {
      ctx.lineTo(startPoint[0], startPoint[1]);
    } else {
      ctx.moveTo(startPoint[0], startPoint[1]);
    }
    const startAngle = Math.atan2(startPoint[1] - center[1], startPoint[0] - center[0]);
    const endAngle = Math.atan2(endPoint[1] - center[1], endPoint[0]- center[0]);
    ctx.arc(center[0], center[1], borderRadius, startAngle, endAngle, !clocWise);
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
