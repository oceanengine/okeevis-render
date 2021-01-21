
import { interpolate, } from './index';

function interpolateObject<T>(from: T, to: T, k: number):T {
  if (!from || !to) {
    return to;
  }
  const ret = Object.create(null) as any;
  for(const key in from) {
    ret[key] = interpolate(from[key], to[key], k);
  }
  return ret;
}

export default interpolateObject;