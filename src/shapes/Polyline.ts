import Shape from './Shape'
import  {CommonAttr, } from './Element'
import { BBox, polygonBBox, } from '../utils/bbox';

export interface PolylineConf extends CommonAttr {
  pointList?: Array<{x: number;y:number}>;
  smooth?: boolean;
  smoothType?: 'bezier' | 'spline';
  smoothConstraint?: {x: number; y: number; width: number; height: number};
  smoothMonotone?: 'x' | 'y';
}
const shapeKeys: Array<keyof PolylineConf> = ['pointList', 'smooth', 'smoothConstraint', 'smoothMonotone', 'smoothType'];

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
    return [
      ...super.getAnimationKeys(),
      'pointList',
    ];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const {pointList, } = this.attr;
    if (!pointList || pointList.length === 0) {
      return;
    }
    ctx.moveTo(pointList[0].x, pointList[0].y);
    pointList.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
  }

  protected computeBBox(): BBox {
    return polygonBBox(this.attr.pointList || []);
    
  }
  
}