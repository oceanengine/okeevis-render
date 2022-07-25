import { PathAction } from './Path2D';
import { getPointOnPolar, PI2, equalWithTolerance } from '../utils/math';

export default function canvasToSvgPath(pathList: PathAction[]): string {
  let out = '';
  for (let i = 0; i < pathList.length; i++) {
    const { action, params } = pathList[i];
    if (action === 'moveTo') {
      out += `M${params[0]},${params[1]} `;
    } else if (action === 'lineTo') {
      out += `L${params[0]},${params[1]} `;
    } else if (action === 'rect') {
      const [x, y, width, height] = params;
      out += `M${x},${y}L${x + width},${y}L${x + width},${y + height}L${x},${y + height}z`;
    } else if (action === 'arc' || action === 'ellipse') {
      out += getArcPath(pathList[i], i);
    } else if (action === 'arcTo') {
      // todo
    } else if (action === 'quadraticCurveTo') {
      out += `Q${params[0]},${params[1]} ${params[2]},${params[3]}`;
    } else if (action === 'bezierCurveTo') {
      out += `C${params[0]},${params[1]} ${params[2]},${params[3]} ${params[4]},${params[5]}`;
    } else if (action === 'closePath') {
      out += 'Z';
    }
  }
  return out;
}

function getArcPath(pathAction: PathAction, i: number): string {
  const { action, params } = pathAction;
  let [cx, cy, r, startAngle, endAngle, antiClocWise ] = params;
  if (action === 'ellipse') {
    cx = params[0];
    cy = params[1];
    r = params[2];
    startAngle = params[5];
    endAngle = params[6];
  }
  const startPoint = getPointOnPolar(cx, cy, r, startAngle);
  const delta = endAngle - startAngle;
  let endPointAngle: number = endAngle;
  if (endAngle - startAngle >= PI2 || equalWithTolerance(delta, PI2)) {
    endPointAngle = startAngle + PI2 - 1e-4;
  } else if (endAngle - startAngle <= -PI2 || equalWithTolerance(delta, -PI2)) {
    endPointAngle = startAngle - PI2 + 1e-4;
  }
  const endPoint = getPointOnPolar(cx, cy, r, endPointAngle);
  const isLargeArc = Math.abs(startAngle - endAngle) >= Math.PI;
  return `${i > 0 ? 'L' : 'M'}${startPoint.x},${startPoint.y}A ${r} ${r} ${0} ${
    isLargeArc ? 1 : 0
  } ${!antiClocWise ? 1 : 0} ${endPoint.x} ${endPoint.y}`;
}
