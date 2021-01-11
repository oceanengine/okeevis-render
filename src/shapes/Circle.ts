import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox, circleBBox, } from '../utils/bbox';

export interface CircleConf extends CommonAttr {
  cx?: number;
  cy?: number;
  radius?: number;
}
const shapeKeys: Array<keyof CircleConf> = ['cx', 'cy', 'radius'];

export default class Circle extends Shape<CircleConf> {
  public type = 'circle';

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
    const { cx, cy, radius, } = this.attr;
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  }
  
  protected computeBBox(): BBox {
    const {cx, cy, radius: r} = this.attr;
    return circleBBox(cx, cy, r);
  }
}
