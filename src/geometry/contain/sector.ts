import { pointInCircle } from './circle';
import { pointInLineStroke } from './line';
import { pointInArcStroke } from './arc';
import { equalWithTolerance, PI2, getPointOnPolar } from '../../utils/math';
import Point from '../../utils/Point';
import { Vec2, angle } from '../../utils/vec2';

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
  const point = new Point(x, y);
  const distance = point.distanceTo(cx, cy);
  const delta = Math.abs(startAngle - endAngle);
  if (distance > r || distance < ri) {
    return false;
  }
  if (equalWithTolerance(startAngle, endAngle)) {
    return false;
  }
  if (equalWithTolerance(delta, PI2) || delta >= PI2) {
    return pointInCircle(cx, cy, r, x, y) && !pointInCircle(cx, cy, ri, x, y);
  }
  const midAngle = (startAngle + endAngle) / 2;
  const midVec: Vec2 = [Math.cos(midAngle), Math.sin(midAngle)];
  const rotate = Math.abs(angle(midVec, [x - cx, y - cy]));
  if (rotate < delta / 2 || equalWithTolerance(rotate, delta / 2)) {
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
  const startInnter = getPointOnPolar(cx, cy, r, startAngle);
  const startOuter = getPointOnPolar(cx, cy, ri, startAngle);
  const endInnter = getPointOnPolar(cx, cy, r, endAngle);
  const endOuter = getPointOnPolar(cx, cy, ri, endAngle);
  return (
    pointInArcStroke(cx, cy, r, startAngle, endAngle, false, lineWidth, x, y) ||
    pointInArcStroke(cx, cy, ri, startAngle, endAngle, false, lineWidth, x, y) ||
    pointInLineStroke(startInnter.x, startInnter.y, startOuter.x, startOuter.y, lineWidth, x, y) ||
    pointInLineStroke(endInnter.x, endInnter.y, endOuter.x, endOuter.y, lineWidth, x, y)
  );
}
