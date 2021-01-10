import {equalWithTolerance, PI2 } from './math';
import Point from './Point';

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function composeBBox(bboxList: BBox[]): BBox {
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;
  bboxList.forEach(box => {
    minX = Math.min(box.x, minX);
    minY = Math.min(box.y, minY);
    maxX = Math.max(box.x + box.width, maxX);
    maxY = Math.max(box.y + box.height, maxY);
  });
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// export function isPointInBBox(x: number, y: number, box: BBox): boolean {

// }

export function rectBBox(x: number, y: number, width: number, height: number): BBox {
  const x2 = x + width;
  const y2 = y + height;
  return {
    x: Math.min(x, x2),
    y: Math.min(y, y2),
    width: Math.abs(width),
    height: Math.abs(height),
  };
}

export function circleBBox(cx: number, cy: number, r: number): BBox {
  return {
    x: cx - r,
    y: cy - r,
    width: r * 2,
    height: r * 2,
  };
}

export function lineBBox(x1: number, y1: number, x2: number, y2: number): BBox {
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const width = Math.abs(x1 - x2);
  const height = Math.abs(y1 - y2);
  return { x, y, width, height };
}

export function arcBBox(cx: number, cy: number, r: number, start: number, end: number): BBox {
  // 找切点
  const delta = Math.abs(end - start);
  if (delta > PI2 || equalWithTolerance(delta, PI2)) {
    return circleBBox(cx, cy, r);
  }
  const isLargeArc = delta > Math.PI;
  const midAngle = (start + end) / 2;
  const startPoint = Point.fromPolar(cx, cy, r, start);
  const endPoint = Point.fromPolar(cx, cy, r, end);
  const distance = endPoint.distanceTo(startPoint.x, startPoint.y);
  const midArcPoint = Point.fromPolar(cx, cy, r, midAngle);
  const center = new Point(cx, cy);
  const lineAngle = endPoint.getAngleFrom(startPoint.x, startPoint.y);
  const sidePoints = isLargeArc
    ? [center.clone().angleMoveTo(lineAngle, r), center.clone().angleMoveTo(-lineAngle, r)]
    : [
        midArcPoint.clone().angleMoveTo(lineAngle, distance),
        midArcPoint.clone().angleMoveTo(-lineAngle, distance),
      ];
  return polygonBBox([startPoint, endPoint, midArcPoint, ...sidePoints]);
}

export function sectorBBox(
  cx: number,
  cy: number,
  r: number,
  ri: number,
  start: number,
  end: number,
): BBox {
  const outerArcBBox = arcBBox(cx, cy, r, start, end);
  const innterArcBBox = arcBBox(cx, cy, ri, start, end);
  return composeBBox([outerArcBBox, innterArcBBox]);
}

export function polygonBBox(points: Array<{ x: number; y: number }>): BBox {
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;
  points.forEach(item => {
    minX = Math.min(item.x, minX);
    maxX = Math.max(item.x, maxX);
    minY = Math.min(item.y, minY);
    maxY = Math.max(item.y, maxY);
  });
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
