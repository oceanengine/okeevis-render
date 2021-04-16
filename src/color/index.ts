import * as Color from 'color';
import Gradient from '../abstract/Gradient';
import LinearGradient from './LinearGradient';
import RadialGradient from './RadialGradient';
import Pattern from './Pattern';
import Element from '../shapes/Element';
import * as lodash from '../utils/lodash';
import { NAME_TRANSPARENT, RGBA_TRANSPARENT } from '../constant';

export { Color };
export type ColorValue = 'none' | string | LinearGradient | RadialGradient | Pattern | null;
export { Gradient, LinearGradient, RadialGradient, Pattern };

function brightenStringColor(color: string, ration: number): string {
  const out = Color(color).lighten(ration);
  const alpha = out.alpha();
  const red = out.red();
  const green = out.green();
  const blue = out.blue();
  if (alpha === 1) {
    return out.hex();
  }
  return `rgba(${[red, green, blue, alpha].join(',')})`;
}

export function brighten(color: ColorValue, ration: number = 0): ColorValue {
  if (!color) {
    return color;
  }

  if (typeof color === 'string') {
    return brightenStringColor(color, ration);
  }

  if (color instanceof LinearGradient || color instanceof RadialGradient) {
    const nextColor = color.clone();
    nextColor.option.stops.forEach(stop => {
      stop.color = brightenStringColor(stop.color, ration);
    });
    return nextColor;
  }

  return color;
}

export function isGradient(color: ColorValue) {
  return color instanceof LinearGradient || color instanceof RadialGradient;
}

export function isPattern(color: ColorValue): boolean {
  return color instanceof Pattern;
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

export function getSVGColor(color: ColorValue): string {
  if (lodash.isString(color)) {
    return color;
  }
  if (
    color instanceof LinearGradient ||
    color instanceof RadialGradient ||
    color instanceof Pattern
  ) {
    return `url(#${color.id})`;
  }
}

// 4时颜色空间约26w
// 8时颜色空间32768

const MAX_SIZE = 32 * 32 * 32;

export function valueToRgb(index: number): [number, number, number] {
  if (index >= MAX_SIZE) {
    console.warn('GPU pick element is larger than 32 * 32 * 32');
    return [0, 0, 0];
  }
  // eslint-disable-next-line no-bitwise
  const r = (index >> 10) % 32;
  // eslint-disable-next-line no-bitwise
  const g = (index >> 5) % 32;
  const b = index % 32;
  return [r * 8, g * 8, b * 8];
}
