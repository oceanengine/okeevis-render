import Shape from './Shape';
import { CommonAttr } from './Element';
import { equalWithTolerance, PI2 } from '../utils/math';

export interface ArcConf extends CommonAttr {
  cx?: number;
  cy?: number;
  radius?: number;
  start?: number;
  end?: number;
  anticlockwise?: boolean;
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
      anticlockwise: false,
    };
  }

  public getAnimationKeys(): Array<keyof ArcConf> {
    return [...super.getAnimationKeys(), 'cx', 'cy', 'radius', 'start', 'end'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    // TODO
    const start: number = this.attr.start;
    let end: number = this.attr.end;
    let anticlockwise: boolean = this.attr.anticlockwise;

    // 一定画圆
    if (equalWithTolerance(Math.abs(start - end), PI2)) {
      anticlockwise = false;
      end = start + PI2;
    }
    // 一定什么都不画
    if (equalWithTolerance(start, end)) {
      anticlockwise = true;
    }
    ctx.arc(this.attr.cx, this.attr.cy, this.attr.radius, start, end, anticlockwise);
  }
}
