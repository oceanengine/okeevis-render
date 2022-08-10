import { LineAttr } from '../shapes/Line';
import { BBox } from './bbox';
import * as lodash from './lodash';

let enable1px = false;

export function enableLine1pxOptimize() {
  enable1px = true;
}

export function pixelOptimize(v: number) {
  return Math.floor(v) + 0.5;
}

export default function line1px(option: LineAttr): LineAttr {
  if (!enable1px) {
    return;
  }
  const min = 1e-4;
  if (Math.abs(option.x1 - option.x2) < min) {
    option.x1 = option.x2 = pixelOptimize(option.x1);
  }
  if (Math.abs(option.y1 - option.y2) < min) {
    option.y1 = option.y2 = pixelOptimize(option.y1);
  }
  return option;
}

export function rect1px(option?: Partial<BBox>): Partial<BBox> {
  if (option) {
    if (lodash.isNumber(option.x) && lodash.isNumber(option.y)) {
      const { x, y, width, height } = option;
      option.x = pixelOptimize(option.x);
      option.y = pixelOptimize(option.y);
      const right = Math.round(x + width) + 0.5;
      const bottom = Math.round(y + height) + 0.5;
      if (option.width > 0 && option.height > 0) {
        option.width = right - option.x;
        option.height = bottom - option.y;
      }
    }
  }
  return option;
}
