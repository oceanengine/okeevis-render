import LRUMap from './lru';
import ES6Set from './set';
import { TextConf } from '../shapes/Text';

import * as styleHelper from '../canvas/style';

export interface TextSize {
  readonly width: number;
  readonly height: number;
}

const textSizeLRUMap = new LRUMap<TextSize>(3000);

let defaultContext: CanvasRenderingContext2D;

const canvasContextPool = new ES6Set<CanvasRenderingContext2D>();

function getDefaultContext(): CanvasRenderingContext2D {
  if (!defaultContext) {
    const canvas = document.createElement('canvas');
    defaultContext = canvas.getContext('2d') as CanvasRenderingContext2D;
  }
  return defaultContext;
}

export function getContext() {
  return canvasContextPool.values().next().value || getDefaultContext();
}

export function addContext(ctx: CanvasRenderingContext2D) {
  canvasContextPool.add(ctx);
}

export function removeContext(ctx: CanvasRenderingContext2D) {
  canvasContextPool.delete(ctx);
}

export function measureTextList(
  textList: string[],
  textStyle: TextConf = {},
  ctx: CanvasRenderingContext2D = getContext(),
): TextSize[] {
  ctx.save();
  initTextContext(ctx, textStyle);
  const sizeList = textList.map(text => measureText(text, textStyle, ctx, false));
  ctx.restore();
  return sizeList;
}

export function measureText(
  text: string,
  textStyle: TextConf = {},
  ctx: CanvasRenderingContext2D = getContext(),
  setContext = true,
): TextSize {
  const cacheKey = getCacheKey(text, textStyle);
  const cacheSize = textSizeLRUMap.get(cacheKey);
  if (cacheSize) {
    return cacheSize;
  }
  setContext && ctx.save();
  setContext && initTextContext(ctx, textStyle);
  const width = ctx.measureText(text).width;
  const height = textStyle.fontSize;
  const size = { width, height };
  textSizeLRUMap.set(cacheKey, size);
  setContext && ctx.restore();
  return size;
}

function initTextContext(ctx: CanvasRenderingContext2D, textStyle: TextConf = {}) {
  const {
    fontFamily = 'sans-serif',
    fontSize = 12,
    fontWeight = 'normal',
    fontStyle = 'normal',
  } = textStyle;
  styleHelper.setFontStyle(ctx, fontSize, fontFamily, fontWeight, fontStyle);
}
function getCacheKey(text: string, textStyle: TextConf): string {
  const {
    fontFamily = 'sans-serif',
    fontSize = 10,
    fontWeight = 'normal',
    fontStyle = 'normal',
  } = textStyle;
  return [text, fontSize, fontFamily, fontWeight, fontStyle].join('__$$__');
}
