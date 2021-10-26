import Shape from './Shape';
import { CommonAttr } from './Element';
import { equalWithTolerance, PI2, getPointOnPolar } from '../utils/math';
import { BBox, sectorBBox } from '../utils/bbox';
import { isPointInSector, isPointInSectorStroke } from '../geometry/contain/sector';

interface Point {
  x: number;
  y: number;
}

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
      ctx.arc(cx, cy, radius, PI2, 0, true);
      ctx.moveTo(cx + radiusI, cy);
      ctx.arc(cx, cy, radiusI, 0, PI2, false);
      return;
    }
    const anticlockwise = end < start;
    if (round || !cornerRadius || cornerRadius === 0) {
      let roundStart: number;
      let roundEnd: number;
      ctx.arc(cx, cy, radiusI, end, start, !anticlockwise);
      if (round) {
        const { x, y } = getPointOnPolar(cx, cy, (radius + radiusI) / 2, start);
        roundStart = !anticlockwise ? start - Math.PI : start + Math.PI;
        roundEnd = start;
        ctx.arc(x, y, Math.abs(radius - radiusI) / 2, roundStart, roundEnd, anticlockwise);
      }
      ctx.arc(cx, cy, radius, start, end, anticlockwise);
      if (round) {
        const { x, y } = getPointOnPolar(cx, cy, (radius + radiusI) / 2, end);
        roundStart = end;
        roundEnd = !anticlockwise ? end + Math.PI : end - Math.PI;
        ctx.arc(x, y, Math.abs(radius - radiusI) / 2, roundStart, roundEnd, anticlockwise);
      }
      ctx.closePath();
    } else {
      let r1: number;
      let r2: number;
      let r3: number;
      let r4: number;
      if (typeof cornerRadius === 'number') {
        r1 = r2 = r3 = r4 = cornerRadius;
      } else {
        [r1, r2, r3, r4] = cornerRadius;
      }
      const cta: number = end - start;
      const l1: number = cta * this.attr.radiusI;
      const l2: number = this.attr.radius - this.attr.radiusI;
      const l3: number = cta * this.attr.radius;
      const l4: number = this.attr.radius - this.attr.radiusI;

      r1 = Math.min(l1 / Math.PI, l2 / Math.PI, r1);
      r2 = Math.min(l2 / Math.PI, l3 / Math.PI, r2);
      r3 = Math.min(l3 / Math.PI, l4 / Math.PI, r3);
      r4 = Math.min(l4 / Math.PI, l1 / Math.PI, r4);

      const angle1: number = r1 ? Math.asin(r1 / (r1 + this.attr.radiusI)) : 0;
      const angle2: number = r2 ? Math.asin(r2 / (this.attr.radius - r2)) : 0;
      const angle3: number = r3 ? Math.asin(r3 / (this.attr.radius - r3)) : 0;
      const angle4: number = r4 ? Math.asin(r4 / (r4 + this.attr.radiusI)) : 0;

      const p0: Point = {
        x: this.attr.radiusI * Math.cos(start) + this.attr.cx,
        y: this.attr.radiusI * Math.sin(start) + this.attr.cy,
      };
      const p0a: Point = {
        x: (this.attr.radiusI + r1) * Math.cos(start) + this.attr.cx,
        y: (this.attr.radiusI + r1) * Math.sin(start) + this.attr.cy,
      };

      const p1: Point = {
        x: (r1 + this.attr.radiusI) * Math.cos(angle1) * Math.cos(start) + this.attr.cx,
        y: (r1 + this.attr.radiusI) * Math.cos(angle1) * Math.sin(start) + this.attr.cy,
      };

      const p2: Point = {
        x: (this.attr.radius - r2) * Math.cos(angle2) * Math.cos(start) + this.attr.cx,
        y: (this.attr.radius - r2) * Math.cos(angle2) * Math.sin(start) + this.attr.cy,
      };

      const p3: Point = {
        x: this.attr.radius * Math.cos(start) + this.attr.cx,
        y: this.attr.radius * Math.sin(start) + this.attr.cy,
      };
      const p3a: Point = {
        x: this.attr.radius * Math.cos(start + angle2) + this.attr.cx,
        y: this.attr.radius * Math.sin(start + angle2) + this.attr.cy,
      };

      const p4: Point = {
        x: this.attr.radius * Math.cos(end) + this.attr.cx,
        y: this.attr.radius * Math.sin(end) + this.attr.cy,
      };
      const p4a: Point = {
        x: (this.attr.radius - r3) * Math.cos(end) + this.attr.cx,
        y: (this.attr.radius - r3) * Math.sin(end) + this.attr.cy,
      };

      const p5: Point = {
        x: (this.attr.radiusI + r4) * Math.cos(angle4) * Math.cos(end) + this.attr.cx,
        y: (this.attr.radiusI + r4) * Math.cos(angle4) * Math.sin(end) + this.attr.cy,
      };
      const p6: Point = {
        x: this.attr.radiusI * Math.cos(end) + this.attr.cx,
        y: this.attr.radiusI * Math.sin(end) + this.attr.cy,
      };
      const p6a: Point = {
        x: this.attr.radiusI * Math.cos(end - angle4) + this.attr.cx,
        y: this.attr.radiusI * Math.sin(end - angle4) + this.attr.cy,
      };

      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.arcTo(p3.x, p3.y, p3a.x, p3a.y, r2);
      ctx.arc(
        this.attr.cx,
        this.attr.cy,
        this.attr.radius,
        // start,
        start + angle2,
        end - angle3,
        anticlockwise,
      );
      ctx.arcTo(p4.x, p4.y, p4a.x, p4a.y, r3);
      ctx.lineTo(p5.x, p5.y);
      ctx.arcTo(p6.x, p6.y, p6a.x, p6a.y, r4);
      ctx.arc(
        this.attr.cx,
        this.attr.cy,
        this.attr.radiusI,
        end - angle4,
        start + angle1,
        !anticlockwise,
      );
      ctx.arcTo(p0.x, p0.y, p0a.x, p0a.y, r1);
    }
  }

  public isPointInFill(x: number, y: number): boolean {
    const { cx, cy, radius, radiusI, start, end } = this.attr;
    // todo round
    return isPointInSector(cx, cy, radius, radiusI, start, end, x, y);
  }

  public isPointInStroke(x: number, y: number, lineWidth: number): boolean {
    const { cx, cy, radius, radiusI, start, end } = this.attr;
    return isPointInSectorStroke(cx, cy, radius, radiusI, start, end, lineWidth, x, y);
  }

  protected computeBBox(): BBox {
    let { cx, cy, radius, radiusI, start, end, round } = this.attr;
    if (round) {
      const delta = Math.asin((radius - radiusI) / radius) * (end > start ? 1 : -1);
      start -= delta;
      end += delta;
    }
    return sectorBBox(cx, cy, radius, radiusI, start, end);
  }
}
