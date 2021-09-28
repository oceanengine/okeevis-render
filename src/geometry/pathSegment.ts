import Path2d, { PathAction } from './Path2D';
import { getPointOnPolar, PI2, equalWithTolerance } from '../utils/math';

interface Segment {
  type: 'line' | 'arc' | 'bezier';
  params: number[];
}

export interface SegmentPoint {
  x: number;
  y: number;
  alpha: number; //  angle of derivative
}
function base3(t: number, p1: number, p2: number, p3: number, p4: number): number {
  var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
    t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
  return t * t2 - 3 * p1 + 3 * p2;
}

function lineLength(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function arcLength(r: number, startAngle: number, endAngle: number): number {
  const theta = Math.abs(endAngle - startAngle);
  return theta * r;
}

function bezierLength(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): number {
  const z = 1;
  var z2 = z / 2,
    n = 12,
    Tvalues = [-.1252, .1252, -.3678, .3678, -.5873, .5873, -.7699, .7699, -.9041, .9041, -.9816, .9816],
    Cvalues = [0.2491, 0.2491, 0.2335, 0.2335, 0.2032, 0.2032, 0.1601, 0.1601, 0.1069, 0.1069, 0.0472, 0.0472],
    sum = 0;
  for (var i = 0; i < n; i++) {
    var ct = z2 * Tvalues[i] + z2,
      xbase = base3(ct, x1, x2, x3, x4),
      ybase = base3(ct, y1, y2, y3, y4),
      comb = xbase * xbase + ybase * ybase;
    sum += Cvalues[i] * Math.sqrt(comb);
  }
  return z2 * sum;
}

function pointAtLine(length: number, x1: number, y1: number, x2: number, y2: number): SegmentPoint {
  const totalLength = lineLength(x1, y1, x2, y2);
  const percent = length / totalLength;
  return {
    x: x1 + (x2 - x1) * percent,
    y: y1 + (y2 - y1) * percent,
    alpha: 0,
  }
}

function pointAtArc(length: number, cx: number, cy: number, r: number, startAngle: number, endAngle: number): SegmentPoint {
  const totalLength = arcLength(r, startAngle, endAngle);
  const percent = length / totalLength;
  const angle = startAngle + percent * (endAngle - startAngle);
  return {
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
    alpha: 0,
  }
}

function pointAtBezier(length: number, x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): SegmentPoint {
  const totalLength = bezierLength(x0, y0, x1, y1, x2, y2, x3, y3);
  const percent = length / totalLength;
  return {
    x: 0,
    y: 0,
    alpha: 0,
  }
}

export function getSegmentLength(segment: Segment): number {
  const segmentFn = {
    line: lineLength,
    arc: arcLength,
    bezier: bezierLength,
  }
  return segmentFn[segment.type].apply(null, segment.params);
}

export function getPointAtSegment(length: number, segment: Segment): SegmentPoint {
  const segmentFn = {
    line: pointAtLine,
    arc: pointAtArc,
    bezier: pointAtBezier,
  }
  return segmentFn[segment.type].apply(null, [length, ...segment.params]);
}

export function getPathSegments(path: Path2d, out: Segment[]): Segment[] {
  const pathList = path.getPathList();
  let startX: number;
  let startY: number;
  let endX: number;
  let endY: number;
  let action: PathAction['action'];
  let params: any[];
  let currentPath: PathAction;
  for (let i = 0; i < pathList.length; i++) {
    currentPath = pathList[i];
    action = currentPath.action;
    params = currentPath.params;
    if (action === 'moveTo') {
      startX = params[0];
      startY = params[1];
      endX = params[0];
      endY = params[1];
    }
    if (action === 'lineTo') {
      const [x, y] = params[0];
      out.push({
        type: 'line',
        params: [endX, endY, x, y]
      });
      endX = x;
      endY = y;
    }
    if (action === 'arc') {
      const [cx, cy, r, start, end, antiClockwise] = params;
      const startPoint = getPointOnPolar(cx, cy, r, start);
      const endPoint = getPointOnPolar(cx, cy, r, end);
      if (i > 0) {
        out.push({
          type: 'line',
          params: [endX, endY, startPoint.x, startPoint.y],
        });
      }
      out.push({
        type: 'arc',
        params: [cx, cy, r, start, end],
      })
      endX = endPoint.x;
      endY = endPoint.y;
    }

    if (action === 'arcTo') {

    }

    if (action === 'bezierCurveTo') {
      const [x2, y2, x3, y3, x4, y4] = params
      out.push({
       type: 'bezier',
       params: [endX, endY, x2, y2, x3, y3, x4, y4],
      })
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
    }
    if (action === 'quadraticCurveTo') {
      
    }

    if (action === 'closePath') {
      out.push({
        type: 'line',
        params: [startX, startY, params[0], params[1]],
      });
      endX = params[0];
      endY = params[1];
    }
  }
  return out;
}
