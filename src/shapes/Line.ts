import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox, lineBBox } from '../utils/bbox';
import { pointInLineStroke } from '../geometry/contain/line';
import line1px from '../utils/line1px';

export interface LineAttr extends CommonAttr {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

const shapeKeys: Array<keyof LineAttr> = ['x1', 'y1', 'x2', 'y2'];

export default class Line extends Shape<LineAttr> {
  public type = 'line';

  public fillAble = false;

  public shapeKeys = shapeKeys;

  public getDefaultAttr(): LineAttr {
    return {
      ...super.getDefaultAttr(),
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
    };
  }

  public mounted() {
    super.mounted();
    line1px(this.attr);
  }

  public getAnimationKeys(): Array<keyof LineAttr> {
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
