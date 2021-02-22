import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox, lineBBox } from '../utils/bbox';
import { pointInLineStroke } from '../geometry/contain/line';
import line1px from '../utils/line1px';

export interface LineConf extends CommonAttr {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  line1px?: boolean;
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
      y2: 0,
    };
  }

  protected prevProcessAttr(attr: LineConf) {
    attr.line1px !== false && line1px(attr);
  }

  public getAnimationKeys(): Array<keyof LineConf> {
    return [...super.getAnimationKeys(), 'x1', 'y1', 'x2', 'y2'];
  }

  public isPointInStroke(x: number, y: number, lineWidth: number): boolean {
    const { x1, y1, x2, y2 } = this.attr;
    return pointInLineStroke(x1, y1, x2, y2, lineWidth, x, y);
  }

  public brush(ctx: CanvasRenderingContext2D) {
    ctx.moveTo(this.attr.x1, this.attr.y1);
    ctx.lineTo(this.attr.x2, this.attr.y2);
  }

  protected computeBBox(): BBox {
    const { x1, y1, x2, y2 } = this.attr;

    return lineBBox(x1, y1, x2, y2);
  }
}
