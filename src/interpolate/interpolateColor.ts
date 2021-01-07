
import {InterpolateFunction, interpolate, } from './index';
import {ColorValue, } from '../color';

const interpolateColor: InterpolateFunction<ColorValue> = (from: ColorValue, to: ColorValue, k: number): ColorValue => {
  if (!from || !to) {
    return to;
  }
  return to;
}

export default interpolateColor;