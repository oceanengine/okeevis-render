import Shape from './Shape'
import  {CommonAttr, } from './Element'

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
    return [
      ...super.getAnimationKeys(),
      'x',
      'y',
      'width',
      'height',
      'r',
    ];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const {x, y, width, height, } = this.attr;
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
  }
  
}