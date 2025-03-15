import { min, max } from 'lodash-es';
import { pointAtBezier } from '../pathSegment';

export function pointInBezierStroke(
  x1: number,
  y1: number,
  cx1: number,
  cy1: number,
  cx2: number,
  cy2: number,
  x2: number,
  y2: number,
  lineWidth: number,
  x: number,
  y: number,
): boolean {
  const minX = min([x1, cx1, x2, cx2]);
  const maxX = max([x1, cx1, x2, cx2]);
  const minY = min([y1, cy1, cy2, y2]);
  const maxY = max([y1, cy1, cy2, y2]);
  const half = lineWidth / 2;
  if (!(x >= minX - half && x <= maxX + half && y >= minY - half && y <= maxY + half)) {
    return false;
  }

  return pointDistanceToBezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2, x, y) < lineWidth / 2;
}

export function pointDistanceToBezier(
  x1: number,
  y1: number,
  cx1: number,
  cy1: number,
  cx2: number,
  cy2: number,
  x2: number,
  y2: number,
  x: number,
  y: number,
): number {
  let minDex,
    samples = 25; // More samples increases the chance of being correct (costing additional calls to bézierPoint).
  let minDistance = Infinity;
  for (let i = samples + 1; i--; ) {
    const t = i / samples;
    const point = pointAtBezier(t, x1, y1, cx1, cy1, cx2, cy2, x2, y2);
    let distance = vec2Distance(point.x, point.y, x, y);
    if (distance < minDistance) {
      minDistance = distance;
      minDex = i;
    }
  }
  const k = localMinimum(
    Math.max((minDex - 1) / samples, 0),
    Math.min((minDex + 1) / samples, 1),
    (t: number): number => {
      const point = pointAtBezier(t, x1, y1, cx1, cy1, cx2, cy2, x2, y2);
      return vec2Distance(point.x, point.y, x, y);
    },
    1e-4,
  );
  const closestPoint = pointAtBezier(k, x1, y1, cx1, cy1, cx2, cy2, x2, y2);
  return vec2Distance(closestPoint.x, closestPoint.y, x, y);
}

function vec2Distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function localMinimum(minX: number, maxX: number, ƒ: (p: number) => number, ε: number = 1e-10) {
  let m = minX,
    n = maxX,
    k;

  while (n - m > ε) {
    k = (n + m) / 2;

    if (ƒ(k - ε) < ƒ(k + ε)) n = k;
    else m = k;
  }

  return k;
}
