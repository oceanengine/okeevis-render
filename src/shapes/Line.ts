import Shape from './Shape'
import  {CommonAttr, } from './Element'

export interface LineConf extends CommonAttr {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

const shapeKeys: Array<keyof LineConf> = ['x1', 'y1', 'x2', 'y2'];

export default class Line extends Shape<LineConf> {
  public type = 'line';

  public fillAble = false;

  public shapeKeys = shapeKeys;

  public getDefaultAttr(): LineConf {
    return {
      ...super.getDefaultAttr(),
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0
    };
  }

  public getAnimationKeys(): Array<keyof LineConf> {
    return [
      ...super.getAnimationKeys(),
      'x1',
      'y1',
      'x2',
      'y2'
    ];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    ctx.moveTo(this.attr.x1, this.attr.y1);
    ctx.lineTo(this.attr.x2, this.attr.y2);
  }
  
}