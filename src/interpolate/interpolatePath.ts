import Path2D from '../geometry/Path2D';
import { InterpolateFunction, interpolate } from './index';

const actionType = [
  'moveTo',
  'lineTo',
  'arc',
  'arcTo',
  'bezierCurveTo',
  'quadraticCurveTo',
  'ellipse',
  'rect'
];

const interpolatePath: InterpolateFunction<Path2D> = (from: Path2D, to: Path2D, k: number): Path2D => {
  const current = to.getPathList().map((pathAction, index) => {
    const oldPath = from.getPathList()[index];
    if (!oldPath || (oldPath.action !== pathAction.action)) { return pathAction; }
    if (actionType.indexOf(pathAction.action) !== -1) {
      return {
        ...pathAction,
        params: pathAction.params.map((param, pIndex) => {
          if (typeof param === 'number') {
            return interpolate(
              oldPath.params[pIndex],
              pathAction.params[pIndex],
              k
            );
          }
          return param;
        })
      }
    }
    return pathAction
  })
  const currentPath2D = new Path2D();
  currentPath2D.setPathList(current);
  return currentPath2D;
}

export default interpolatePath;