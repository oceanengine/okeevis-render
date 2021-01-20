
import {InterpolateFunction, interpolate, } from './index';

const interpolateArray: InterpolateFunction<any[]> = (from: any[], to: any[], k: number): any[] => {
  const ret = to.slice();
  for (let i = 0; i < to.length; i++) {
    ret[i] = interpolate(from[i], to[i], k);
  }
  return ret;
}

export default interpolateArray;