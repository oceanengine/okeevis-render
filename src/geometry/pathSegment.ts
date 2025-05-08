import Path2d, { PathAction } from './Path2D';
import { getPointOnPolar, equalWithTolerance } from '../utils/math';
import { pointInLineStroke } from './contain/line';
import { pointInArcStroke } from './contain/arc';
import { pointInBezierStroke } from './contain/bezier';
import { pointInEllipseStroke } from './contain/ellipse';
import { angle, Vec2 } from '../utils/vec2';
import { divideBezierAt } from './bezierSubdivision';

export interface Segment {
  type: 'line' | 'arc' | 'bezier' | 'ellipse'; // todo ellipse/qurdatic
  params: number[];
}

export interface SegmentPoint {
  x: number;
  y: number;
  alpha: number; //  angle of derivative
}
function base3(t: number, p1: number, p2: number, p3: number, p4: number): number {
  const t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4;
  const t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
  return t * t2 - 3 * p1 + 3 * p2;
}

function lineLength(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function arcLength(r: number, startAngle: number, endAngle: number): number {
  const theta = Math.abs(endAngle - startAngle);
  return theta * r;
}

/**
 * learned from Snap.svg
 * Apache-2.0 License
 * https://github.com/adobe-webplatform/Snap.svg/blob/master/src/path.js
 */
function bezierLength(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
  z = 1,
): number {
  const z2 = z / 2;
  const n = 12;
  const Tvalues = [
    -0.1252,
    0.1252,
    -0.3678,
    0.3678,
    -0.5873,
    0.5873,
    -0.7699,
    0.7699,
    -0.9041,
    0.9041,
    -0.9816,
    0.9816,
  ];
  const Cvalues = [
    0.2491,
    0.2491,
    0.2335,
    0.2335,
    0.2032,
    0.2032,
    0.1601,
    0.1601,
    0.1069,
    0.1069,
    0.0472,
    0.0472,
  ];
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const ct = z2 * Tvalues[i] + z2;
    const xbase = base3(ct, x1, x2, x3, x4);
    const ybase = base3(ct, y1, y2, y3, y4);
    const comb = xbase * xbase + ybase * ybase;
    sum += Cvalues[i] * Math.sqrt(comb);
  }
  return z2 * sum;
}

function pointAtLine(t: number, x1: number, y1: number, x2: number, y2: number): SegmentPoint {
  return {
    x: x1 + (x2 - x1) * t,
    y: y1 + (y2 - y1) * t,
    alpha: Math.atan2(y2 - y1, x2 - x1),
  };
}

function pointAtArc(
  t: number,
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): SegmentPoint {
  const angle = startAngle + t * (endAngle - startAngle);
  const antiClockwise = startAngle > endAngle;
  const theta = angle + (antiClockwise ? -Math.PI / 2 : Math.PI / 2);
  return {
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
    alpha: theta,
  };
}

export function pointAtBezier(
  t: number,
  p1x: number,
  p1y: number,
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  p2x: number,
  p2y: number,
): SegmentPoint {
  const t1 = 1 - t;
  const t13 = Math.pow(t1, 3);
  const t12 = Math.pow(t1, 2);
  const t2 = t * t;
  const t3 = t2 * t;
  const x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x;
  const y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y;
  const mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x);
  const my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y);
  const nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x);
  const ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y);
  // ax = t1 * p1x + t * c1x,
  // ay = t1 * p1y + t * c1y,
  // cx = t1 * c2x + t * p2x,
  // cy = t1 * c2y + t * p2y,
  const alpha = Math.PI / 2 - Math.atan2(mx - nx, my - ny) + Math.PI;
  // (mx > nx || my < ny) && (alpha += Math.PI);
  return {
    x,
    y,
    // m: {x: mx, y: my},
    // n: {x: nx, y: ny},
    // start: {x: ax, y: ay},
    // end: {x: cx, y: cy},
    alpha,
  };
}

function pointAtEllipse(t: number, cx: number, cy: number, rx: number, ry: number, start: number, end: number, antiClockwise: boolean) {
  return {
    x: 0,
    y: 0,
    alpha: 0
  }
}

export function getSegmentLength(segment: Segment): number {
  if (segment.type === 'line') {
    return lineLength.apply(null, segment.params);
  }
  if (segment.type === 'arc') {
    const r = segment.params[2];
    const start = segment.params[3];
    const end = segment.params[4];
    return arcLength(r, start, end);
  }
  if (segment.type === 'bezier') {
    return bezierLength.apply(null, segment.params);
  }
}

export function clipSegment(segment: Segment, t1: number, t2: number): Segment {
  if (segment.type === 'line') {
    const [x1, y1, x2, y2] = segment.params;
    const dx = x2 - x1;
    const dy = y2 - y1;
    return {
      type: 'line',
      params: [x1 + dx * t1, y1 + dy * t1, x1 + dx * t2, y1 + dy * t2],
    };
  }
  if (segment.type === 'arc') {
    const [cx, cy, r, start, end] = segment.params;
    const delta = end - start;
    return {
      type: 'arc',
      params: [cx, cy, r, start + delta * t1, start + delta * t2],
    }
  }
  if (segment.type === 'bezier') {
    const divideCurves = divideBezierAt(segment.params, t1);
    if (t2 === 1) {
      return {
        type: 'bezier',
        params: divideCurves[1],
      }
    }
    const divideCurves2 = divideBezierAt(divideCurves[1], (t2 - t1) / (1 - t1));
    return {
      type: 'bezier',
      params: divideCurves2[0],
    }
  }
}

export function reverseSegment(segment: Segment): Segment {
  if (segment.type === 'line') {
    const [x1, y1, x2, y2] = segment.params;
    return {
      type: 'line',
      params: [x2, y2, x1, y1],
    }
  }
  if (segment.type === 'arc') {
    const [cx, cy, r, start, end, antiClockWise = 0] = segment.params;
    return {
      type: 'arc',
      params: [cx, cy, r, end, start, Number(!antiClockWise)],
    }
  }
  if (segment.type === 'bezier') {
    const [x1, y1, c1x, c1y, c2x, c2y, x2, y2] = segment.params;
    return {
      type: 'bezier',
      params: [x2, y2, c2x, c2y, c1x, c1y, x1, y1],
    }
  }
}

const segmentFn = {
  line: pointAtLine,
  arc: pointAtArc,
  bezier: pointAtBezier,
  ellipse: pointAtEllipse,
};
export function getPointAtSegment(t: number, segment: Segment): SegmentPoint {
  return segmentFn[segment.type].apply(null, [t, ...segment.params]);
}

export function isPointInSegmentStroke(segment: Segment, lineWidth: number, x: number, y: number): boolean {
  const { type, params} = segment;
  if (type === 'line') {
    const [x1, y1, x2, y2] = params;
    return pointInLineStroke(x1, y1, x2, y2, lineWidth, x, y);
  }

  if (type === 'arc') {
    const [cx, cy, r, start, end] = params;
    return pointInArcStroke(cx, cy, r, start, end, false, lineWidth, x, y);
  }

  if (type === 'ellipse') {
    const [cx, cy, rx, ry, xAxisRotation, start, end, clockWise] = params;
    const midAngle = (start + end) / 2 + xAxisRotation;
    const midVec: Vec2 = [Math.cos(midAngle), Math.sin(midAngle)];
    const rotate = Math.abs(angle(midVec, [x - cx, y - cy]));
    const delta = Math.abs(start - end);
    const inAngle = rotate < delta / 2 || equalWithTolerance(rotate, delta / 2);
    return pointInEllipseStroke(cx, cy, rx, ry, lineWidth, x, y) && inAngle;
  }

  if (type === 'bezier') {
    const [x1, y1, c1x, c1y, c2x, c2y, x2, y2] = params;
    return pointInBezierStroke(x1, y1, c1x, c1y, c2x, c2y, x2, y2, lineWidth, x, y);
  }
  
  return false;
}

export function getPathSegments(path: Path2d, out: Segment[], type: 'stroke' | 'fill'= 'stroke'): Segment[] {
  const pathList = path.getPathList();
  let startX: number;
  let startY: number;
  let endX: number;
  let endY: number;
  let action: PathAction['action'];
  let params: number[];
  let currentPath: PathAction;
  let subSegmentIndex: number = 0;
  
  const pushLineSegment = (seg: Segment) => {
    if (seg.type === 'line') {
      const [x1, y1, x2, y2] = seg.params;
      if (x1 !== x2 || y1 !== y2) {
        out.push({
          type: 'line',
          params: [x1, y1, x2, y2],
        });
      }
    }
  }
  for (let i = 0; i < pathList.length; i++) {
    currentPath = pathList[i];
    action = currentPath.action;
    params = currentPath.params;

    if (action === 'moveTo') {
      if (type === 'fill') {
        const isClosable = isSegmentClosable(out.slice(subSegmentIndex));
        if (isClosable  && !(startX === endX && startY === endY)) {
          pushLineSegment({
            type: 'line',
            params: [endX, endY, startX, startY],
          });
          subSegmentIndex = out.length;
        }
      }
      startX = params[0];
      startY = params[1];
      endX = params[0];
      endY = params[1];
    }
    if (action === 'lineTo') {
      const [x, y] = params;
      pushLineSegment({
          type: 'line',
          params: [endX, endY, x, y],
        });
        endX = x;
        endY = y;
    }
    if (action === 'arc') {
      const [cx, cy, r, start, end, antiClockWise] = params;
      const startPoint = getPointOnPolar(cx, cy, r, start);
      const endPoint = getPointOnPolar(cx, cy, r, end);
      if (i === 0) {
        startX = startPoint.x;
        startY = startPoint.y;
      }
      if (i > 0) {
        pushLineSegment({
          type: 'line',
          params: [endX, endY, startPoint.x, startPoint.y],
        });
      }
      out.push({
        type: 'arc',
        params: [cx, cy, r, start, end, antiClockWise],
      });
      endX = endPoint.x;
      endY = endPoint.y;
    }

    if (action === 'arcTo') {
      // todo
      
    }

    if (action === 'bezierCurveTo') {
      const [x2, y2, x3, y3, x4, y4] = params;
      out.push({
        type: 'bezier',
        params: [endX, endY, x2, y2, x3, y3, x4, y4],
      });
      endX = x4;
      endY = y4;
    }

    if (action === 'rect') {
      const [x, y, width, height] = params;
      out.push({
        type: 'line',
        params: [x, y, x + width, y],
      });
      out.push({
        type: 'line',
        params: [x + width, y, x + width, y + height],
      });
      out.push({
        type: 'line',
        params: [x + width, y + height, x, y + height],
      });
      out.push({
        type: 'line',
        params: [x, y + height, x, y],
      });
      endX = x;
      endY = y;
      subSegmentIndex = out.length;
    }
    if (action === 'quadraticCurveTo') {
      // todo
    }

    if (action === 'ellipse') {
      const [cx, cy, rx, ry, rotation, start, end, clockWise] = params;
      out.push({
        type: 'ellipse',
        params: [cx,cy, rx, ry, rotation, start, end, clockWise]
      });
      endX = cx + rx * Math.cos(end);
      endY = cy + ry * Math.sin(end);
    }

    if (action === 'closePath' && !(startX === endX && startY === endY)) {
      pushLineSegment({
        type: 'line',
        params: [endX, endY, startX, startY],
      });
      endX = params[0];
      endY = params[1];
      subSegmentIndex = out.length;
    }
  }
  if (type === 'fill') {
    const lastSegments = out.slice(subSegmentIndex);
    if (isSegmentClosable(lastSegments)  && !(startX === endX && startY === endY)) {
      out.push({
        type: 'line',
        params: [endX, endY, startX, startY],
      });
    }
  }
  return out;
}

function isSegmentClosable(segments: Segment[]): boolean {
  return !(!segments.length  || (segments.length === 1 && segments[0].type === 'line'));
}