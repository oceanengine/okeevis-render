import Shape from './Shape';
import { CommonAttr } from './Element';
import { equalWithTolerance, PI2, getPointOnPolar } from '../utils/math';
import { BBox, sectorBBox } from '../utils/bbox';
import { isPointInSector, isPointInSectorStroke } from '../geometry/contain/sector';

export interface SectorConf extends CommonAttr {
  cx?: number;
  cy?: number;
  radius?: number;
  radiusI?: number;
  start?: number;
  end?: number;
  round?: boolean;
  cornerRadius?: number | number[];
}

const shapeKeys: Array<keyof SectorConf> = [
  'cx',
  'cy',
  'radius',
  'radiusI',
  'start',
  'end',
  'round',
];

export default class Sector extends Shape<SectorConf> {
  public type = 'sector';

  public shapeKeys = shapeKeys;

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
    };
  }

  public getAnimationKeys(): Array<keyof SectorConf> {
    return [...super.getAnimationKeys(), 'cx', 'cy', 'start', 'end', 'radius', 'radiusI'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const { cx, cy, radius, radiusI, start, end, round, cornerRadius } = this.attr;
    if (equalWithTolerance(start, end)) {
      return;
    }
    const delta = Math.abs(start - end);
    if (equalWithTolerance(delta, PI2) || delta > PI2) {
      ctx.arc(cx, cy, radiusI, 0, PI2, true);
      ctx.moveTo(cx + radius, cy);
      ctx.arc(cx, cy, radius, PI2, 0, false);
      return;
    }
    const anticlockwise = end < start;
    if (round || !cornerRadius || cornerRadius === 0) {
      let roundStart: number;
      let roundEnd: number;
      // 内弧
      ctx.arc(cx, cy, radiusI, end, start, !anticlockwise);
      if (round) {
        const {x, y} = getPointOnPolar(cx, cy, (radius + radiusI) / 2, start);
        roundStart = !anticlockwise ? start - Math.PI : start + Math.PI;
        roundEnd = start;
        ctx.arc(x, y, Math.abs(radius - radiusI) / 2, roundStart, roundEnd, anticlockwise);
      }
      // 外弧
      ctx.arc(cx, cy, radius, start, end, anticlockwise);
      if (round) {
        const {x, y} = getPointOnPolar(cx, cy, (radius + radiusI) / 2, end);
        roundStart = end;
        roundEnd = !anticlockwise ? end + Math.PI : end - Math.PI;
        ctx.arc(x, y, Math.abs(radius - radiusI) / 2, roundStart, roundEnd, anticlockwise);
      }
      ctx.closePath();
    } else {

    }
  }

  public isPointInFill(x: number, y: number): boolean {
    const {cx, cy, radius, radiusI, start, end, } = this.attr;
    return isPointInSector(cx, cy, radius, radiusI, start, end, x, y);
  }

  public isPointInStroke(x: number, y: number, lineWidth: number): boolean {
    const {cx, cy, radius, radiusI, start, end, } = this.attr;
    return isPointInSectorStroke(cx, cy, radius, radiusI, start, end, lineWidth, x, y);
  }

  protected computeBBox(): BBox {
    const { cx, cy, radius, radiusI, start, end } = this.attr;
    return sectorBBox(cx, cy, radius, radiusI, start, end);
  }
}
