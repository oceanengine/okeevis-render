import { pointInCircle } from './circle';
import { equalWithTolerance, PI2, normalizeAngle, } from '../../utils/math';
import Point from '../../utils/Point';

export function isPointInSector(
  cx: number,
  cy: number,
  r: number,
  ri: number,
  startAngle: number,
  endAngle: number,
  x: number,
  y: number,
): boolean {
  const delta = Math.abs(startAngle - endAngle);
  const point = new Point(x, y);
  const distance = point.distanceTo(cx, cy);
  if (distance > r || distance < ri) {
    return false;
  }
  if (equalWithTolerance(delta, PI2) || delta >= PI2) {
    return pointInCircle(cx, cy, r, x, y) && !pointInCircle(cx, cy, ri, x, y);
  }
  const angle = normalizeAngle(point.getAngleFrom(0, 0));
  const start = normalizeAngle(startAngle);
  const end = normalizeAngle(endAngle);
  if (angle >= start && angle <= end) {
    return true;
  }
  return false;
}

export function isPointInSectorStroke(
  cx: number,
  cy: number,
  r: number,
  ri: number,
  startAngle: number,
  endAngle: number,
  lineWidth: number,
  x: number,
  y: number,
): boolean {
  return isPointInSector(cx, cy, r + lineWidth / 2, ri + lineWidth / 2, startAngle, endAngle, x, y) && isPointInSector(cx, cy, r - lineWidth / 2, ri - lineWidth / 2, startAngle, endAngle, x, y);
}
