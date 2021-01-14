import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox, rectBBox, inBBox, getOffsetBBox } from '../utils/bbox';

export interface RectConf extends CommonAttr {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  r?: number | number[];
}
const shapeKeys: Array<keyof RectConf> = ['x', 'y', 'width', 'height'];

export default class Rect extends Shape<RectConf> {
  public type = 'rect';

  public pickByGPU = false;

  public shapeKeys = shapeKeys;

  public getDefaultAttr(): RectConf {
    return {
      ...super.getDefaultAttr(),
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      r: 0,
    };
  }

  public getAnimationKeys(): Array<keyof RectConf> {
    return [...super.getAnimationKeys(), 'x', 'y', 'width', 'height', 'r'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height } = this.attr;
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
  }

  public isPointInFill(x: number, y: number): boolean {
    return inBBox(this.getBBox(), x, y);
  }

  public isPointInStroke(x: number, y: number, lineWidth: number): boolean {
    const outterBBox = getOffsetBBox(this.getBBox(), lineWidth / 2);
    const innerBBox = getOffsetBBox(this.getBBox(), -lineWidth / 2);
    return inBBox(outterBBox, x, y) && !inBBox(innerBBox, x, y);
  }

  protected computeBBox(): BBox {
    const { x, y, width, height } = this.attr;
    return rectBBox(x, y, width, height);
  }
}
