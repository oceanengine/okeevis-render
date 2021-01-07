
import {InterpolateFunction, interpolate, } from './index';

const interpolateArray: InterpolateFunction<any[]> = (from: any[], to: any[], k: number): any[] => {
  const fromLen = from.length;
  const toLen = to.length;
  const len = Math.min(fromLen, toLen);
  const ret = to.slice();
  for (let i = 0; i < len; i++) {
    ret[i] = interpolate(from[i], to[i], k);
  }
  return ret;
}

export default interpolateArray;