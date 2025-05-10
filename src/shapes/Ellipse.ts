/**
 *  https://www.cnblogs.com/shn11160/archive/2012/08/27/2658057.html
 * ellipsis polyfill
 */
import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox } from '../utils/bbox';
import { pointInEllipseFill, pointInEllipseStroke } from '../geometry/contain/ellipse';

export interface EllipseAttr extends CommonAttr {
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
}
const shapeKeys: Array<keyof EllipseAttr> = ['cx', 'cy', 'rx', 'ry'];

export default class Circle extends Shape<EllipseAttr> {
  public type = 'ellipse';

  public shapeKeys = shapeKeys;

  public getDefaultAttr(): EllipseAttr {
    return {
      ...super.getDefaultAttr(),
      cx: 0,
      cy: 0,
      rx: 0,
      ry: 0,
    };
  }

  public getAnimationKeys(): Array<keyof EllipseAttr> {
    return [...super.getAnimationKeys(), 'cx', 'cy', 'rx', 'ry'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const { cx, cy, rx, ry } = this.attr;
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2, false);
    //  polyfill
    //  ctx.save();
    //  choose Max(a, b) as the arc radius
    //  const r = (rx > ry) ? rx : ry;
    //  const ratioX = rx / r;
    //  const ratioY = ry / r;
    //  ctx.scale(ratioX, ratioY);
    //  ctx.beginPath();
    //  ctx.moveTo((cx + rx) / ratioX, cy / ratioY);
    //  ctx.arc(cx / ratioX, cy / ratioY, r, 0, 2 * Math.PI);
    //  ctx.closePath();
    //  ctx.restore();
  }

  public isPointInFill(x: number, y: number): boolean {
    const { cx, cy, rx, ry } = this.attr;
    return pointInEllipseFill(cx, cy, rx, ry, x, y);
  }

  public isPointInStroke(x: number, y: number, lineWidth: number): boolean {
    const { cx, cy, rx, ry } = this.attr;
    return pointInEllipseStroke(cx, cy, rx, ry, lineWidth, x, y);
  }

  protected computeBBox(): BBox {
    const { cx, cy, rx, ry } = this.attr;
    return {
      x: cx - rx,
      y: cy - ry,
      width: rx * 2,
      height: ry * 2,
    };
  }
}
