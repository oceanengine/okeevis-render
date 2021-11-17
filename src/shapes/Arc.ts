import Shape from './Shape';
import { CommonAttr } from './Element';
import { getPointOnPolar } from '../utils/math';
import { arcBBox, BBox } from '../utils/bbox';
import { pointInArcStroke, pointInArcFill } from '../geometry/contain/arc';

export interface ArcAttr extends CommonAttr {
  cx?: number;
  cy?: number;
  radius?: number;
  start?: number;
  end?: number;
  closePath?: boolean;
}

const shapeKeys: Array<keyof ArcAttr> = ['cx', 'cy', 'radius', 'start', 'end'];

export default class Arc extends Shape<ArcAttr> {
  public type = 'arc';

  public readonly shapeKeys = shapeKeys;

  public getDefaultAttr(): ArcAttr {
    return {
      ...super.getDefaultAttr(),
      cx: 0,
      cy: 0,
      radius: 0,
      start: 0,
      end: 0,
      closePath: false,
    };
  }

  public getAnimationKeys(): Array<keyof ArcAttr> {
    return [...super.getAnimationKeys(), 'cx', 'cy', 'radius', 'start', 'end'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const { cx, cy, radius, start, end, closePath } = this.attr;
    const anticlockwise = start > end;
    const p1 = getPointOnPolar(cx, cy, radius, start);
    ctx.moveTo(p1.x, p1.y);
    ctx.arc(cx, cy, radius, start, end, anticlockwise);
    closePath && ctx.closePath();
  }

  public isPointInFill(x: number, y: number): boolean {
    const { cx, cy, radius, start, end } = this.attr;
    return pointInArcFill(cx, cy, radius, start, end, x, y);
  }

  public isPointInStroke(x: number, y: number, lineWidth: number): boolean {
    const { cx, cy, radius, start, end, closePath } = this.attr;
    return pointInArcStroke(cx, cy, radius, start, end, closePath, lineWidth, x, y);
  }

  protected computeBBox(): BBox {
    const { cx, cy, radius, start, end } = this.attr;
    return arcBBox(cx, cy, radius, start, end);
  }
}
