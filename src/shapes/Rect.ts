import Shape from './Shape';
import { CommonAttr } from './Element';
import * as lodash from '../utils/lodash';
import { BBox, rectBBox, inBBox, getOffsetBBox } from '../utils/bbox';
interface Point {
  x: number;
  y: number;
}

export interface RectAttr extends CommonAttr {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  borderRadius?: number | number[];
  r?: number | number[];
}
const shapeKeys: Array<keyof RectAttr> = ['x', 'y', 'width', 'height'];

export default class Rect extends Shape<RectAttr> {
  public type = 'rect';

  public shapeKeys = shapeKeys;

  public getDefaultAttr(): RectAttr {
    return {
      ...super.getDefaultAttr(),
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  public getAnimationKeys(): Array<keyof RectAttr> {
    return [...super.getAnimationKeys(), 'x', 'y', 'width', 'height', 'r'];
  }

  public brush(ctx: CanvasRenderingContext2D): void {
    const { x, y, width, height, borderRadius = 0, r = borderRadius } = this.attr;
    if ((width === 0 || height === 0) && !this.isClip) {
      return;
    }
    if (!r) {
      ctx.rect(x, y, width, height);
    } else {
      // topleft topright bottomright bottomleft
      let r1: number;
      let r2: number;
      let r3: number;
      let r4: number;
      if (lodash.isArray(r)) {
        if (r.length === 0) {
          r1 = r2 = r3 = r4 = 0;
        }
        if (r.length === 1) {
          r1 = r2 = r3 = r4 = r[0];
        } else if (r.length === 2) {
          r1 = r3 = r[0];
          r2 = r4 = r[1];
        } else if (r.length === 3) {
          r1 = r[0];
          r2 = r4 = r[1];
          r3 = r[2];
        } else if (r.length >= 4) {
          [r1, r2, r3, r4] = r;
        }
      } else {
        r1 = r2 = r3 = r4 = r as number;
      }
      const absWidth: number = Math.abs(width / 2);
      const absHeight: number = Math.abs(height / 2);
      const rect = this.getBBox();
      r1 = Math.min(r1, absWidth, absHeight);
      r2 = Math.min(r2, absWidth, absHeight);
      r3 = Math.min(r3, absWidth, absHeight);
      r4 = Math.min(r4, absWidth, absHeight);

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

  /**
   * @override
   * @param count 分割的数量
   */
  public divide(count: number): Rect[] {
    const n = Math.ceil(Math.sqrt(count));
    const {x, y, width, height, fill } = this.attr;
    const res: Rect[] = [];
    for (let i = 0; i < n; i++ ) {
      for (let j = 0; j < n; j++) {
        res.push(new Rect({
          x: x + width * i / n,
          y: y + height * j / n,
          width: width / n,
          height: height / n,
          fill,
        }));
      }
    }
    return res;
  }

  protected computeBBox(): BBox {
    const { x, y, width, height } = this.attr;
    return rectBBox(x, y, width, height);
  }
}
