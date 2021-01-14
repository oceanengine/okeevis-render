import { pointInCircle } from './circle';
import { equalWithTolerance, PI2 } from '../../utils/math';
import Point from '../../utils/Point';
import { Vec2, angle } from '../../utils/vec2';


export function pointInArcStroke(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  lineWidth: number,
  x: number,
  y: number,
): boolean {
  const point = new Point(x, y);
  const distance = point.distanceTo(cx, cy);
  const delta = Math.abs(startAngle - endAngle);
  if (distance > r + lineWidth / 2 || distance < r - lineWidth / 2) {
    return false;
  }
  if (equalWithTolerance(startAngle, endAngle)) {
    return false;
  }
  if (equalWithTolerance(delta, PI2) || delta >= PI2) {
    return pointInCircle(cx, cy, r + lineWidth / 2, x, y) && !pointInCircle(cx, cy, r - lineWidth / 2, x, y);
  }
  const midAngle = (startAngle + endAngle) / 2;
  const midVec: Vec2 = [Math.cos(midAngle), Math.sin(midAngle)];
  const rotate = angle(midVec, [x - cx, y - cy]);
  if (Math.abs(rotate) < Math.abs(startAngle - endAngle) / 2) {
    return true;
  }
  return false;
}
