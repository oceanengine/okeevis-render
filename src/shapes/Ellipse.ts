/**
 *  https://www.cnblogs.com/shn11160/archive/2012/08/27/2658057.html
 * 椭圆polyfill
 */
import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox, circleBBox } from '../utils/bbox';
import { pointInEllipseFill, pointInEllipseStroke } from '../geometry/contain/ellipse';

export interface EllipseConf extends CommonAttr {
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
}
const shapeKeys: Array<keyof EllipseConf> = ['cx', 'cy', 'rx', 'ry'];

export default class Circle extends Shape<EllipseConf> {
  public type = 'ellipse';

  public pickByGPU = false;

  public shapeKeys = shapeKeys;

  public getDefaultAttr(): EllipseConf {
    return {
      ...super.getDefaultAttr(),
      cx: 0,
      cy: 0,
      rx: 0,
      ry: 0,
    };
  }

  public getAnimationKeys(): Array<keyof EllipseConf> {
    return [...super.getAnimationKeys(), 'cx', 'cy', 'rx', 'ry'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const { cx, cy, rx, ry } = this.attr;
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    //  polyfill
    //  ctx.save();
    //  选择a、b中的较大者作为arc方法的半径参数
    //  const r = (rx > ry) ? rx : ry;
    //  const ratioX = rx / r; // 横轴缩放比率
    //  const ratioY = ry / r; // 纵轴缩放比率v
    //  ctx.scale(ratioX, ratioY); // 进行缩放（均匀压缩）
    //  ctx.beginPath();
    //  // 从椭圆的左端点开始逆时针绘制
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
