import { ShapeConf } from '../shapes/Shape';
import {InterpolateFunction, } from './index';
import interpolateObject from './interpolateObject';
import interpolateColor from './interpolateColor';
import interpolatePath from './interpolatePath';

export default function interpolateAttr(from: ShapeConf, to: ShapeConf, k: number): ShapeConf {
  return interpolateObject<ShapeConf>(from, to, k, {
    fill: interpolateColor,
    stroke: interpolateColor,
    pathData: interpolatePath,
    shadowColor: interpolateColor,
  } as Record<keyof ShapeConf, InterpolateFunction>);
}
