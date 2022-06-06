import * as Color from 'color';
import type Gradient from '../abstract/Gradient';
import type LinearGradient from './LinearGradient';
import type RadialGradient from './RadialGradient';
import type Pattern from './Pattern';
import type Element from '../shapes/Element';
import * as lodash from '../utils/lodash';
import { NAME_TRANSPARENT, RGBA_TRANSPARENT } from '../constant';

export { Color };
export type ColorValue = 'none' | string | LinearGradient | RadialGradient | Pattern | null;
export { Gradient, LinearGradient, RadialGradient, Pattern };

function brightenStringColor(color: string, ration: number): string {
  const out = Color(color).lighten(ration);
  const alpha = out.alpha();
  if (alpha === 1) {
    return out.hex();
  }
  const red = Math.round(out.red());
  const green = Math.round(out.green());
  const blue = Math.round(out.blue());
  return `rgba(${[red, green, blue, alpha].join(',')})`;
}

export function brighten(color: ColorValue, ration: number = 0): ColorValue {
  if (!color) {
    return color;
  }

  if (typeof color === 'string') {
    return brightenStringColor(color, ration);
  }

  if ((color as Gradient).isGradient) {
    const nextColor = (color as Gradient).clone() as LinearGradient;
    nextColor.option.stops.forEach(stop => {
      stop.color = brightenStringColor(stop.color, ration);
    });
    return nextColor;
  }

  return color;
}

export function alpha(color: string, alpha: number): string {
  const out = Color(color).alpha(alpha);
  const red = Math.round(out.red());
  const green = Math.round(out.green());
  const blue = Math.round(out.blue());
  return `rgba(${[red, green, blue, alpha].join(',')})`;
}

export function isGradient(color: ColorValue): boolean {
  return color && (color as Gradient).isGradient;
}

export function isPattern(color: ColorValue): boolean {
  return color && (color as Pattern).isPattern;
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
  if ((color as Gradient).isGradient) {
    return (color as Gradient).getCanvasContextStyle(ctx, item.getBBox());
  }
  if ((color as Pattern).isPattern) {
    return (color as Pattern).getCanvasContextStyle(ctx, () => {
      item.dirty();
    });
  }
}

export function getSVGColor(color: ColorValue): string {
  if (lodash.isString(color)) {
    return color;
  }
  if (
    isGradient(color) || isPattern(color)
  ) {
    return `url(#${color.id})`;
  }
}

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
