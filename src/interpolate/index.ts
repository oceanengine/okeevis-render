
import * as lodash from '../utils/lodash';

import interpolateNumber from './interpolateNumber';
import interpolateArray from './interpolateArray';
import interpolateObject from './interpolateObject';


export function interpolate<T=any>(from: T, to: T, k: number): T {
  
  if (lodash.isNumber(from) && lodash.isNumber(to)) {
    return interpolateNumber(from, to, k) as any as T;
  } if (lodash.isArray(from) && lodash.isArray(to)) {
    return interpolateArray(from, to, k) as any as T;
  } if (lodash.isObject(from) && lodash.isObject(to)) {
    return interpolateObject(from, to, k);
  }

  return to;
  
}

export type InterpolateFunction<T=any> = (from: T, to: T, k: number) => T;
