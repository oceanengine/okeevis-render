import Path2D, { PathAction } from './Path2D';
import { getPathSegments, Segment } from './pathSegment';
import * as mat3 from '../../js/mat3';
import { transformMat3 } from '../utils/vec2';
import { equalWithTolerance } from '../utils/math';

export function getPathCurveList(path: Path2D): number[][] {
  const segments = getPathSegments(path, []);
  const curveList: number[][] = [];
  segments.forEach(seg => segmentToCurve(seg, curveList));
  
  return curveList;
}

export function segmentToCurve(seg: Segment, out: number[][]): number[][] {
  const { type, params } = seg;
  if (type === 'line') {
    const [x1, y1, x2, y2] = params;
    out.push(lineToCurve(x1, y1, x2, y2));
  } else if (type === 'arc') {
    const [cx, cy, r, start, end, antiClockwise] = params;
    ellipseToCurve(cx, cy, r, r, 0, start, end, !antiClockwise as any as boolean, out);
  } else if (type === 'bezier') {
    out.push([...params]);
  } else if (type === 'ellipse') {
    const [cx, cy, rx, ry, rotation, start, end, clockWise] = params;
    ellipseToCurve(cx, cy, rx, ry, rotation, start, end, clockWise as any as boolean, out);
  }
  return out;
}

export function pathToCurve(path: Path2D): Path2D {
  const curveList: number[][] = getPathCurveList(path);
  const curvePath = new Path2D();
  let prevX: number;
  let prevY: number;
  for (let i = 0; i < curveList.length; i++) {
    const [p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y] = curveList[i];
    if (!equalWithTolerance(p1x, prevX, 1e-4) || !equalWithTolerance(p1y, prevY, 1e-4)) {
      curvePath.moveTo(p1x, p1y);
    }
    curvePath.bezierCurveTo(p2x, p2y, p3x, p3y, p4x, p4y);
    prevX = p4x;
    prevY = p4y;
  }
  return curvePath;
}
function lineToCurve(x1: number, y1: number, x2: number, y2: number): number[] {
  return [x1, y1, x1, y1, x2, y2, x2, y2];
}
function ellipseToCurve(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  xAxisRotation: number,
  start: number,
  end: number,
  clockWise: boolean,
  res: number[][],
) {
  const gap = end - start;
  const delta = Math.min(Math.abs(end - start), Math.PI * 2);
  const n = Math.ceil(delta / (Math.PI / 2));
  for (let i = 1; i <= n; i++) {
    res.push(arcToCurve(cx, cy, rx, ry, xAxisRotation, start + gap * (i - 1) / n, start + gap * i / n, clockWise));
  }
}

function arcToCurve(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  xAxisRotation: number,
  start: number,
  end: number,
  clockWise: boolean,
): number[] {
  const theta = (end - start) * (clockWise ? 1 : -1);
  const h = ((4 / 3) * (1 - Math.cos(theta / 2))) / Math.sin(theta / 2);
  const p1 = [1, 0];
  const p2 = [1, p1[1] + h];
  const p3 = [Math.cos(theta) + h * Math.sin(theta), Math.sin(theta) - h * Math.cos(theta)];
  const p4 = [Math.cos(theta), Math.sin(theta)];
  const matrix = mat3.create();
  //先缩放，后旋转，再平移
  mat3.translate(matrix, matrix, [cx, cy]);
  mat3.rotate(matrix, matrix, start + xAxisRotation);
  mat3.scale(matrix, matrix, [rx, ry]);
  [p1, p2, p3, p4].forEach((p: [number, number]) => transformMat3(p, p, matrix));
  return [...p1, ...p2, ...p3, ...p4];
}
