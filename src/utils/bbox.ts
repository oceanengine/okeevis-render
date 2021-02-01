import { equalWithTolerance, PI2 } from './math';
import Point from './Point';

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createZeroBBox(): BBox {
  return {x: 0, y: 0, width: 0, height: 0};
}

export function ceilBBox(box: BBox): BBox {
  const {x, y, width, height} = box;
  const x1 = Math.floor(x - 0.5);
  const y1 = Math.floor(y - 0.5);
  const x2 = Math.ceil(x + width + 0.5);
  const y2 = Math.ceil(y + height + 0.5);
  return {
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1,
  }
}

export function inBBox( bbox: BBox, x: number, y: number, lineWidth = 0): boolean {
  return x >= bbox.x - lineWidth / 2 && x <= bbox.x + bbox.width + lineWidth / 2 && y >= bbox.y  - lineWidth / 2 && y <= bbox.y + bbox.height + lineWidth / 2;
}

/**
 * 用来判断两个矩形是否相交
 * @param a 相交矩形a
 * @param b 相交矩形b
 */
export function bboxIntersect(a: BBox, b: BBox): boolean {
  return (
    Math.abs(a.x + a.width / 2 - (b.x + b.width / 2)) * 2 < a.width + b.width &&
    Math.abs(a.y + a.height / 2) - (b.y + b.height / 2) * 2 < a.height + b.height
  );
}

export function getOffsetBBox(bbox: BBox, offset: number): BBox {
  return {
    x: bbox.x - offset,
    y: bbox.y - offset,
    width: bbox.width + offset * 2,
    height: bbox.height + offset * 2,
  };
}

export function unionBBox(bboxList: BBox[]): BBox {
  bboxList = bboxList.filter(box => box.width > 0 && box.height > 0);
  if (bboxList.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < bboxList.length; i++) {
    const box = bboxList[i];
    if (box.width === 0 || box.height === 0) {
      continue;
    }
    minX = Math.min(box.x, minX);
    minY = Math.min(box.y, minY);
    maxX = Math.max(box.x + box.width, maxX);
    maxY = Math.max(box.y + box.height, maxY);
  }
 
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

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
  if (r === 0 || equalWithTolerance(start, end)) {
    return {
      x: cx,
      y: cy,
      width: 0,
      height: 0,
    };
  }
  // 找圆弧中心点切线平移形成包围盒
  const delta = Math.abs(end - start);
  const xRange = [cx - r, cx + r];
  const yRange = [cy - r, cy + r];
  if (delta > PI2 || equalWithTolerance(delta, PI2)) {
    return circleBBox(cx, cy, r);
  }
  const isLargeArc = delta > Math.PI;
  const midAngle = (start + end) / 2;
  const startPoint = Point.fromPolar(cx, cy, r, start);
  const endPoint = Point.fromPolar(cx, cy, r, end);
  const distance = endPoint.distanceTo(startPoint.x, startPoint.y);
  const lineAngle = endPoint.getAngleFrom(startPoint.x, startPoint.y);
  const midArcPoint = Point.fromPolar(cx, cy, r, midAngle);
  const midPoint = new Point((startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2);
  const mideArcSidePoints = [
    midArcPoint.clone().angleMoveTo(lineAngle, isLargeArc ? r : distance / 2),
    midArcPoint.clone().angleMoveTo(lineAngle + Math.PI, isLargeArc ? r : distance / 2),
  ];
  const midSidePoints = [
    midPoint.clone().angleMoveTo(lineAngle, isLargeArc ? r : distance / 2),
    midPoint.clone().angleMoveTo(lineAngle + Math.PI, isLargeArc ? r : distance / 2),
  ];
  const { x, y, width, height } = polygonBBox([...mideArcSidePoints, ...midSidePoints]);
  const left = Math.max(xRange[0], x);
  const top = Math.max(yRange[0], y);
  const right = Math.min(xRange[1], x + width);
  const bottom = Math.min(yRange[1], y + height);
  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
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
  const innterArcBBox = arcBBox(cx, cy, Math.max(ri, 1e-6), start, end);
  return unionBBox([outerArcBBox, innterArcBBox]);
}

export function polygonBBox(points: Array<{ x: number; y: number }>): BBox {
  if (points.length === 0) {
    return {x: 0, y: 0, width: 0, height: 0};
  }
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
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
