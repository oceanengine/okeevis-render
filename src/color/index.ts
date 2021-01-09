import Gradient from '../abstract/Gradient';
import LinearGradient from './LinearGradient';
import RadialGradient from './RadialGradient';
import Pattern from './Pattern';
import Element from '../shapes/Element';
import * as lodash from '../utils/lodash';
import { NAME_TRANSPARENT, RGBA_TRANSPARENT } from '../constant';

export type ColorValue = string | LinearGradient | RadialGradient | Pattern;

export { Gradient, LinearGradient, RadialGradient, Pattern };

export function isGradient(color: ColorValue) {
  return color instanceof LinearGradient || color instanceof RadialGradient;
}

export function isTransparent(color: ColorValue) {
  return color === RGBA_TRANSPARENT || color === NAME_TRANSPARENT;
}

export function getCtxColor(
  ctx: CanvasRenderingContext2D,
  color: ColorValue,
  item: Element,
): string | CanvasGradient | CanvasPattern {
  if (lodash.isString(color)) {
    return color;
  }
  if (color instanceof LinearGradient) {
    return color.getCanvasContextStyle(ctx, item.getBBox());
  }
  if (color instanceof RadialGradient) {
    return color.getCanvasContextStyle(ctx, item.getBBox());
  }
  if (color instanceof Pattern) {
    return color.getCanvasContextStyle(ctx, () => {
      item.dirty();
    });
  }
}

// 4时颜色空间约26w
// 8时颜色空间32768


export function valueToRgb(index: number): [number, number, number] {
  if (index >= 32 * 32 * 32) {
    console.warn('GPU pick element is larger than 32 * 32 * 32');
    return [0, 0, 0];
  }
  // eslint-disable-next-line no-bitwise
  const r = (index >> 10) % 32;
  // eslint-disable-next-line no-bitwise
  const g = (index >> 5) % 32;
  const b = index % 32;
  return [r * 8, g * 8, b * 8]
}