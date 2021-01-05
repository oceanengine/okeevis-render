import Shape from './Shape';
import { CommonAttr } from './Element';
import {getPointOnPolar, } from '../utils/math';

export interface SectorConf extends CommonAttr {
  cx?: number;
  cy?: number;
  radius?: number;
  radiusI?: number;
  start?: number;
  end?: number;
  anticlockwise?: boolean;
  round?: boolean;
  cornerRadius?: number | number[];
}

export default class Sector extends Shape<SectorConf> {
  public type = 'sector';

  public getDefaultAttr(): SectorConf {
    return {
      ...super.getDefaultAttr(),
      cx: 0,
      cy: 0,
      radius: 0,
      radiusI: 0,
      start: 0,
      end: 0,
      round: false,
      cornerRadius: 0,
      anticlockwise: false,
    };
  }

  public getAnimationKeys(): Array<keyof SectorConf> {
    return [...super.getAnimationKeys(), 'cx', 'cy', 'start', 'end', 'radius', 'radiusI'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const {cx, cy, radius, radiusI, start, end, } = this.attr;
    const anticlockwise = end < start;
    const p1 = getPointOnPolar(cx, cy, radiusI, end);
    const p2 = getPointOnPolar(cx, cy, radius, start);
    ctx.moveTo(p1.x, p1.y);
    ctx.arc(cx, cy, radiusI, end, start, !anticlockwise);
    ctx.lineTo(p2.x, p2.y);
    ctx.arc(cx, cy, radius, start, end, anticlockwise);
    ctx.closePath()
  }
}
