import Path2d, { PathAction } from './Path2D';

interface Segment {
  action: PathAction['action'];
  length: number;
  startLength: number;
  endLength: number;
  startPoint: [number, number];
  endPoint: [number, number];
  params: number;
}


export function getPathLength(path: Path2d): number {
  const pathList = path.getPathList();
  let startX: number;
  let startY: number;
  let endX: number;
  let endY: number;
  let pathLegnth: number = 0;
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
      pathLegnth += Math.sqrt()
      endX = x;
      endY = y;
    }
    if (action === 'arc') {

    }

    if (action === 'arcTo') {

    }

    if (action === 'bezierCurveTo') {

    }

    if (action === 'rect') {

    }
    if (action === 'quadraticCurveTo') {

    }

    if (action === 'closePath') {

    }
  }
}
