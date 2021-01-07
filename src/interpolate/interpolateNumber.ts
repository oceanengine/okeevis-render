
import {InterpolateFunction, } from './index';

const interpolateNumber: InterpolateFunction<number> = (from: number, to: number, k: number): number => {
  return from + (to - from) * k;
}

export default interpolateNumber;