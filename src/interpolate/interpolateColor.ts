import * as Color from 'color';
import { InterpolateFunction } from './index';
import interpolate from './interpolate';
import { ColorValue, Gradient, isGradient } from '../color';
import LinearGradient from '../color/LinearGradient';
import RadialGradient from '../color/RadialGradient';

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
  if (isGradient(from) && isGradient(to) && (from as Gradient).type === (to as Gradient).type) {
    const option = interpolate((from as Gradient).option, (to as Gradient).option, k, interpolateMap);
    const GradientConstructor = (from as LinearGradient).type === 'linearGradient' ? LinearGradient : RadialGradient;
    return new GradientConstructor(option);
  }
  
  return to;
}
