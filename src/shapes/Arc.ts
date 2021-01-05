import Shape from './Shape';
import { CommonAttr } from './Element';
import {PI2, getPointOnPolar,  } from '../utils/math';

export interface ArcConf extends CommonAttr {
  cx?: number;
  cy?: number;
  radius?: number;
  start?: number;
  end?: number;
}

export default class Arc extends Shape<ArcConf> {
  public type = 'arc';

  public getDefaultAttr(): ArcConf {
    return {
      ...super.getDefaultAttr(),
      cx: 0,
      cy: 0,
      radius: 0,
      start: 0,
      end: PI2,
    };
  }

  public getAnimationKeys(): Array<keyof ArcConf> {
    return [...super.getAnimationKeys(), 'cx', 'cy', 'radius', 'start', 'end'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    // TODO
    const {cx, cy, radius, start, end,} = this.attr;
    const anticlockwise = start > end;
    const p1 = getPointOnPolar(cx, cy, radius, start);
    ctx.moveTo(p1.x, p1.y);
    ctx.arc(cx, cy, radius, start, end, anticlockwise);
  }
}
