import Path2D from '../geometry/Path2D';
import {InterpolateFunction, interpolate, } from './index';

const interpolatePath: InterpolateFunction<Path2D> = (from: Path2D, to: Path2D, k: number): Path2D => {
  return to;
}

export default interpolatePath;