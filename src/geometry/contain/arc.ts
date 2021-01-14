import { pointInCircle } from './circle';
import { pointInLineStroke } from './line';
import { isPointInSector } from './sector';
import { equalWithTolerance, PI2, getPointOnPolar } from '../../utils/math';
import Point from '../../utils/Point';
import { Vec2, angle, cross } from '../../utils/vec2';

export function pointInArcFill(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  x: number,
  y: number,
): boolean {
  const inSector = isPointInSector(cx, cy, r, 0, startAngle, endAngle, x, y);
  const isLargeArc = Math.abs(endAngle - startAngle) > Math.PI;
  const delta = Math.abs(startAngle - endAngle);
  const midAngle = (startAngle + endAngle) / 2;
  const oppositeMidAngle = midAngle + Math.PI;

  if (equalWithTolerance(delta, PI2) || delta > PI2) {
    return pointInCircle(cx, cy, r, x, y);
  }

  const { x: startX, y: startY } = getPointOnPolar(cx, cy, r, startAngle);
  const { x: endX, y: endY } = getPointOnPolar(cx, cy, r, endAngle);
  const { x: midX, y: midY } = getPointOnPolar(cx, cy, r, oppositeMidAngle);
  const lineVec = [endX - startX, endY - startY] as Vec2;
  // 寻找一个在图形外部的参考点, 判断同侧关系
  const outSideVec: Vec2 = !isLargeArc
    ? [cx - startX, cy - startY]
    : [midX - startX, midY - startY];
  const pointStartVec = [x - startX, y - startY] as Vec2;
  const crossCenter = cross([] as any, lineVec, outSideVec)[2];
  const crossStart = cross([] as any, lineVec, pointStartVec)[2];
  const isSameSide = crossCenter * crossStart > 0;
  return isLargeArc ? pointInCircle(cx, cy, r, x, y) && !isSameSide : inSector && !isSameSide;
}

export function pointInArcStroke(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  closePath: boolean,
  lineWidth: number,
  x: number,
  y: number,
): boolean {
  const point = new Point(x, y);
  const distance = point.distanceTo(cx, cy);
  const { x: startX, y: startY } = getPointOnPolar(cx, cy, r, startAngle);
  const { x: endX, y: endY } = getPointOnPolar(cx, cy, r, endAngle);
  const delta = Math.abs(startAngle - endAngle);
  if (closePath && pointInLineStroke(startX, startY, endX, endY, lineWidth, x, y)) {
    return true;
  }
  if (distance > r + lineWidth / 2 || distance < r - lineWidth / 2) {
    return false;
  }
  if (equalWithTolerance(startAngle, endAngle)) {
    return false;
  }
  if (equalWithTolerance(delta, PI2) || delta >= PI2) {
    return (
      pointInCircle(cx, cy, r + lineWidth / 2, x, y) &&
      !pointInCircle(cx, cy, r - lineWidth / 2, x, y)
    );
  }
  const midAngle = (startAngle + endAngle) / 2;
  const midVec: Vec2 = [Math.cos(midAngle), Math.sin(midAngle)];
  const rotate = angle(midVec, [x - cx, y - cy]);
  if (Math.abs(rotate) < Math.abs(startAngle - endAngle) / 2) {
    return true;
  }
  return false;
}
