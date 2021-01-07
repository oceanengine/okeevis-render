
import {InterpolateFunction, interpolate, } from './index';

function interpolateObject<T>(from: T, to: T, k: number, interpolateMap:Record<keyof T, InterpolateFunction<any>>={} as any):T {
  if (!from || !to) {
    return to;
  }
  const ret = {} as any;
  // eslint-disable-next-line guard-for-in
  for(const key in from) {
    const fn = interpolateMap[key] || interpolate;
    ret[key] = fn(from[key], to[key], k);
  }
  return ret;
}

export default interpolateObject;