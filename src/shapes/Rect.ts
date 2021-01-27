import Shape from './Shape';
import { CommonAttr } from './Element';
import * as lodash from '../utils/lodash';
import { BBox, rectBBox, inBBox, getOffsetBBox } from '../utils/bbox';

interface Point {
  x: number;
  y: number;
}

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

  public brush(ctx: CanvasRenderingContext2D): void {
    // 没有圆角的时候直接渲染矩形
    if (!this.attr.r) {
        ctx.rect(
            this.attr.x,
            this.attr.y,
            this.attr.width,
            this.attr.height,
        );
    } else {
        // 1 2 3 4分别为左上 右上 右下 左下
        let r1: number;
        let r2: number;
        let r3: number;
        let r4: number;
        if (lodash.isArray(this.attr.r)) {
            [r1, r2, r3, r4] = this.attr.r;
        } else {
            r1 = r2 = r3 = r4 = this.attr.r;
        }
        const width: number = Math.abs(this.attr.width / 2);
        const height: number = Math.abs(this.attr.height / 2);
        const rect = this.getBBox();
        r1 = Math.min(r1, width, height);
        r2 = Math.min(r2, width, height);
        r3 = Math.min(r3, width, height);
        r4 = Math.min(r4, width, height);

        const c1: Point = {
            x: rect.x + r1,
            y: rect.y + r1,
        };
        const c2: Point = {
            x: rect.x + rect.width - r2,
            y: rect.y + r2,
        };
        const c3: Point = {
            x: rect.x + rect.width - r3,
            y: rect.y + +rect.height - r3,
        };
        const c4: Point = {
            x: rect.x + r4,
            y: rect.y + rect.height - r4,
        };

        const p1: Point = {
            x: rect.x + r1,
            y: rect.y,
        };
        const p2: Point = {
            x: rect.x + rect.width - r2,
            y: rect.y,
        };
        const p4: Point = {
            x: rect.x + rect.width,
            y: rect.y + rect.height - r3,
        };
        const p6: Point = {
            x: rect.x + r4,
            y: rect.y + rect.height,
        };
        const p8: Point = {
            x: rect.x,
            y: rect.y + r1,
        };
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.arc(c2.x, c2.y, r2, Math.PI * 1.5, Math.PI * 2, false);
        ctx.lineTo(p4.x, p4.y);
        ctx.arc(c3.x, c3.y, r3, Math.PI * 0, Math.PI * 0.5, false);
        ctx.lineTo(p6.x, p6.y);
        ctx.arc(c4.x, c4.y, r4, Math.PI * 0.5, Math.PI * 1, false);
        ctx.lineTo(p8.x, p8.y);
        ctx.arc(c1.x, c1.y, r1, Math.PI * 1, Math.PI * 1.5, false);
    }
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
