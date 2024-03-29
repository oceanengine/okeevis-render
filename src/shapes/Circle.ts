import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox, circleBBox } from '../utils/bbox';
import { pointInCircle, pointInCircleStroke } from '../geometry/contain/circle';

const PI2 = Math.PI * 2;

export interface CircleAttr extends CommonAttr {
  cx?: number;
  cy?: number;
  radius?: number;
}
const shapeKeys: Array<keyof CircleAttr> = ['cx', 'cy', 'radius'];

export default class Circle extends Shape<CircleAttr> {
  public type = 'circle';

  public shapeKeys = shapeKeys;

  public getDefaultAttr(): CircleAttr {
    return {
      ...super.getDefaultAttr(),
      cx: 0,
      cy: 0,
      radius: 0,
    };
  }

  public getAnimationKeys(): Array<keyof CircleAttr> {
    return [...super.getAnimationKeys(), 'cx', 'cy', 'radius'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const { cx, cy, radius } = this.attr;
    ctx.arc(cx, cy, Math.max(radius, 0), 0, PI2, false);
  }

  public isPointInFill(x: number, y: number): boolean {
    const { cx, cy, radius } = this.attr;
    return pointInCircle(cx, cy, radius, x, y);
  }

  public isPointInStroke(x: number, y: number, lineWidth: number): boolean {
    const { cx, cy, radius } = this.attr;
    return pointInCircleStroke(cx, cy, radius, lineWidth, x, y);
  }

  protected computeBBox(): BBox {
    const { cx, cy, radius: r } = this.attr;
    return circleBBox(cx, cy, r);
  }
}
