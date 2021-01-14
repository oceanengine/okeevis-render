import Shape from './Shape';
import { CommonAttr } from './Element';
import { equalWithTolerance, PI2, } from '../utils/math';
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

  public pickByGPU = false;

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
    const { cx, cy, radius, radiusI, start, end } = this.attr;
    if (equalWithTolerance(start, end)) {
      return;
    }
    const delta = Math.abs(start - end);
    if (equalWithTolerance(delta, PI2) || delta > PI2) {
      ctx.arc(cx, cy, radiusI, 0, PI2, true);
      ctx.moveTo(cx + radius, cy);
      ctx.arc(cx, cy, radius, 0, PI2, false);
      return;
    }
    const anticlockwise = end < start;
    // const p1 = getPointOnPolar(cx, cy, radiusI, end);
    // const p2 = getPointOnPolar(cx, cy, radius, start);
    ctx.arc(cx, cy, radiusI, end, start, !anticlockwise);
    ctx.arc(cx, cy, radius, start, end, anticlockwise);
    ctx.closePath();
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
