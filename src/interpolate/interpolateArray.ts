import { InterpolateFunction } from './index';
import interpolate from './interpolate';

const interpolateArray: InterpolateFunction<any[]> = (
  from: any[],
  to: any[],
  k: number,
  interpolateMap?: Record<string, InterpolateFunction>,
): any[] => {
  const ret = to.slice();
  for (let i = 0; i < to.length; i++) {
    ret[i] = interpolate(from[i], to[i], k, interpolateMap);
  }
  return ret;
};

export default interpolateArray;
