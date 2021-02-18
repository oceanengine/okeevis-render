import { LineConf, } from '../shapes/Line';

let enable1px = false;

export function enableLine1pxOptimize() {
  enable1px = true;
}

export function pixelOptimize(v: number) {
  return Math.floor(v) + 0.5;
}

export default function line1px(option: LineConf): LineConf {
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