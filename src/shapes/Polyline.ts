import Shape from './Shape';
import { CommonAttr } from './Element';
import * as lodash from '../utils/lodash';
import { BBox, polygonBBox } from '../utils/bbox';
import { pointInPolygonFill, pointInPolygonStroke } from '../geometry/contain/polygon';
import bezierSmooth from '../geometry/bezier-smooth';
import catmullRom from '../geometry/catmull-rom';

interface Point {
  x: number;
  y: number;
}
export interface PolylineConf extends CommonAttr {
  pointList?: Point[];
  smooth?: boolean;
  smoothType?: 'bezier' | 'spline';
  smoothConstraint?: [Point, Point];
  smoothMonotone?: 'x' | 'y';
}
const shapeKeys: Array<keyof PolylineConf> = [
  'pointList',
  'smooth',
  'smoothConstraint',
  'smoothMonotone',
  'smoothType',
];

export default class Polyline extends Shape<PolylineConf> {
  public type = 'polyline';  

  public shapeKeys = shapeKeys;

  public getDefaultAttr(): PolylineConf {
    return {
      ...super.getDefaultAttr(),
      pointList: [],
      smooth: false,
      smoothType: 'spline',
    };
  }

  public getAnimationKeys(): Array<keyof PolylineConf> {
    return [...super.getAnimationKeys(), 'pointList'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const { pointList } = this.attr;
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
      for (let i: number = 1; i < pointList.length; i++) {
        ctx.lineTo(pointList[i].x, pointList[i].y);
      }
    }
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
  
  public  pickByGPU(): boolean {
    return this.attr.smooth;
  }
}
