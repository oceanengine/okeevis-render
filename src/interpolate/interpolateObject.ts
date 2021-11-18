import { InterpolateFunction } from './index';
import interpolate from './interpolate';

function interpolateObject<T>(
  from: T,
  to: T,
  k: number,
  interpolateMap?: Record<string, InterpolateFunction>,
): T {
  if (!from || !to) {
    return to;
  }
  const ret = Object.create(null) as any;
  let interpolator: InterpolateFunction;
  for (const key in from) {
    interpolator = interpolateMap && interpolateMap[key] ? interpolateMap[key] : interpolate;
    ret[key] = interpolator(from[key], to[key], k, interpolateMap);
  }
  return ret;
}

export default interpolateObject;
