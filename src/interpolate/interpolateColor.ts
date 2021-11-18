import * as Color from 'color';
import { InterpolateFunction } from './index';
import interpolate from './interpolate';
import { ColorValue, LinearGradient, RadialGradient } from '../color';

const interpolateMap: Record<string, InterpolateFunction> = {
  color: interpolateColor,
};

export default function interpolateColor(from: ColorValue, to: ColorValue, k: number): ColorValue {
  if (!from || !to) {
    return to;
  }

  if (typeof from === 'string' && typeof to === 'string') {
    if (from === 'none' || to === 'none') {
      return to;
    }
    const fromColor = Color(from).object();
    const toColor = Color(to).object();
    if (fromColor.alpha === undefined) {
      fromColor.alpha = 1;
    }
    if (toColor.alpha === undefined) {
      toColor.alpha = 1;
    }
    const out = interpolate(fromColor, toColor, k);
    out.alpha = parseFloat(out.alpha.toFixed(3));
    return Color(out).toString();
  }

  if (from instanceof LinearGradient && to instanceof LinearGradient) {
    const option = interpolate(from.option, to.option, k, interpolateMap);
    return new LinearGradient(option);
  }

  if (from instanceof RadialGradient && to instanceof LinearGradient) {
    const option = interpolate(from.option, to.option, k, interpolateMap);
    return new RadialGradient(option);
  }

  return to;
}
