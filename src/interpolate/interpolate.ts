import * as lodash from '../utils/lodash';
import { InterpolateFunction } from './index';
import interpolateNumber from './interpolateNumber';
import interpolateArray from './interpolateArray';
import interpolateObject from './interpolateObject';

export default function interpolate<T = any>(
  from: T,
  to: T,
  k: number,
  interpolateMap?: Record<string, InterpolateFunction>,
): T {
  if (typeof from === 'number' && typeof to === 'number') {
    return (interpolateNumber(from, to, k) as any) as T;
  }
  if (Array.isArray(from) && Array.isArray(to)) {
    return (interpolateArray(from as any[], to as any[], k, interpolateMap) as any) as T;
  }
  if (lodash.isObject(from) && lodash.isObject(to)) {
    return interpolateObject(from, to, k, interpolateMap);
  }

  return to;
}
