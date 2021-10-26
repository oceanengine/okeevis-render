import * as vec2 from '../../utils/vec2';
import { lineBBox, inBBox } from '../../utils/bbox';

export function pointInLineStroke(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lineWidth: number,
  x: number,
  y: number,
): boolean {
  const bbox = lineBBox(x1, y1, x2, y2);
  if (!inBBox(bbox, x, y, lineWidth)) {
    return;
  }
  return pointDistanceToLine(x1, y1, x2, y2, x, y) <= lineWidth / 2;
}

function pointDistanceToLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number,
  y: number,
): number {
  const d = [x2 - x1, y2 - y1] as vec2.Vec2;
  if (vec2.exactEquals(d, [0, 0])) {
    return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
  }
  const u = [-d[1], d[0]] as vec2.Vec2;
  vec2.normalize(u, u);
  const a = [x - x1, y - y1] as vec2.Vec2;
  return Math.abs(vec2.dot(a, u));
}
