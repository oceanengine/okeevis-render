import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox, circleBBox, } from '../utils/bbox';
import {pointInCircle, pointInCircleStroke, } from '../geometry/contain/circle'

export interface CircleConf extends CommonAttr {
  cx?: number;
  cy?: number;
  radius?: number;
}
const shapeKeys: Array<keyof CircleConf> = ['cx', 'cy', 'radius'];

export default class Circle extends Shape<CircleConf> {
  public type = 'circle';

  public pickByGPU = false;

  public shapeKeys = shapeKeys;
  
  public getDefaultAttr(): CircleConf {
    return {
      ...super.getDefaultAttr(),
      cx: 0,
      cy: 0,
      radius: 0,
    };
  }

  public getAnimationKeys(): Array<keyof CircleConf> {
    return [...super.getAnimationKeys(), 'cx', 'cy', 'radius'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const {cx, cy, radius} = this.attr;
    ctx.arc(cx, cy, Math.max(radius, 0), 0, Math.PI * 2, true);
  }

  public isPointInFill(x: number, y: number): boolean {
    const {cx, cy, radius} = this.attr;
    return pointInCircle(cx, cy, radius, x, y);
  }

  public isPointInStroke(x: number, y: number, lineWidth: number): boolean {
    const {cx, cy, radius} = this.attr;
    return pointInCircleStroke(cx, cy, radius, lineWidth, x, y);
  }
  
  protected computeBBox(): BBox {
    const {cx, cy, radius: r} = this.attr;
    return circleBBox(cx, cy, r);
  }
}
