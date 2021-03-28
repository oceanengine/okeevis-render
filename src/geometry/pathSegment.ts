import Path2d, { PathAction } from './Path2D';
import { getPointOnPolar, PI2, equalWithTolerance } from '../utils/math';

interface Segment {
  action: PathAction['action'];
  length: number;
  startPoint?: [number, number];
  params: any[];
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
  let length: number;
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
      length = Math.sqrt((x - endX) **2 + (y - endY) ** 2);
      out.push({
        action,
        params,
        length,
        startPoint: [endX, endY],
      });
      endX = x;
      endY = y;
    }
    if (action === 'arc') {
      const [cx, cy, r, start, end, antiClockwise] = params;
      const startPoint = getPointOnPolar(cx, cy, r, start);
      const length = Math.abs(end - start) * r;
      if (i > 0) {
        out.push({
          action: 'lineTo',
          params: [startPoint.x, startPoint.y],
          length: 0,
        });
      }
      out.push({
        action,
        params,
        length,
      })
    }

    if (action === 'arcTo') {

    }

    if (action === 'bezierCurveTo') {
      out.push({
        action,
        length: 0,
        params,
      })
    }

    if (action === 'rect') {
      out.push({
        action,
        length: 0,
        params: [0, 1]
      })
    }
    if (action === 'quadraticCurveTo') {
      out.push({
        action,
        length: 0,
        params,
      })
    }

    if (action === 'closePath') {
      out.push({
        action: 'lineTo',
        length: 0,
        params,
      })
    }
  }
  return out;
}
