import { equalWithTolerance } from '../../utils/math';
import { pointInLineStroke } from './line';

interface Point {
  x: number;
  y: number;
}

function isEdgePoind(points: Point[], x: number, y: number): boolean {
  let flag: boolean = false;

  for (let j: number = 0; j < points.length; j = j + 1) {
    const current = points[j];
    if (equalWithTolerance(current.x, x) && equalWithTolerance(current.y, y)) {
      flag = true;
      break;
    }
  }

  return flag;
}

export function pointInPolygonFill(pointList: Point[], x: number, y: number): boolean {
  let countNum: number = 0;
  for (let i: number = 0; i < pointList.length; i = i + 1) {
    const p1: Point = pointList[i];
    const p2: Point = pointList[(i + 1) % pointList.length];

    if (p1.y === p2.y) {
      continue;
    }
    if (Math.max(p1.y, p2.y) < y) {
      continue;
    }

    if (Math.min(p1.y, p2.y) > y) {
      continue;
    }

    const vertex: number = (p2.x * y - p2.x * p1.y + p1.x * p2.y - p1.x * y) / (p2.y - p1.y);
    if (isEdgePoind([p1, p2], vertex, y) && equalWithTolerance(y, Math.max(p1.y, p2.y))) {
      continue;
    }
    if (vertex > x) {
      countNum = countNum + 1;
    }
  }

  return countNum % 2 === 1;
}

export function pointInPolygonStroke(
  points: Point[],
  closed: boolean,
  lineWidth: number,
  x: number,
  y: number,
): boolean {
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    let next = points[i + 1];
    if (closed && !next) {
      next = points[0];
    }
    if (!next) {
      return false;
    }
    if (pointInLineStroke(current.x, current.y, next.x, next.y, lineWidth, x, y)) {
      return true;
    }
  }
  return false;
}
