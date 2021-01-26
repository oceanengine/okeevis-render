import * as ES6Set from 'es6-set';
import { TextConf } from '../shapes/Text';
import LRUMap from './LRU';
import * as styleHelper from '../canvas/style';

const textSizeLRUMap = new LRUMap<TextMetrics>(3000);



let defaultContext: CanvasRenderingContext2D;
const canvasContextPool = new ES6Set<CanvasRenderingContext2D>();

function getDefaultContext(): CanvasRenderingContext2D {
  if (!defaultContext) {
    const canvas = document.createElement('canvas');
    defaultContext = canvas.getContext('2d') as CanvasRenderingContext2D;
  }
  return defaultContext;
}

export function addContext(ctx: CanvasRenderingContext2D) {
  canvasContextPool.add(ctx);
}

export function removeContext(ctx: CanvasRenderingContext2D) {
  canvasContextPool.delete(ctx);
}

export  function measureTextList(textList: string[], textStyle: TextConf = {}, ctx: CanvasRenderingContext2D = getDefaultContext()): TextMetrics[] {
  ctx.save();
  initTextContext(ctx, textStyle);
  const sizeList = textList.map(text => measureText(text, textStyle, ctx, false))
  ctx.restore();
  return sizeList;
}

export  function measureText(text: string, textStyle: TextConf = {}, ctx: CanvasRenderingContext2D = getDefaultContext(), setContext = true): TextMetrics {
  const cacheKey = getCacheKey(text, textStyle);
  const cacheSize = textSizeLRUMap.get(cacheKey);
  if (cacheSize) {
    return cacheSize 
  }
  setContext && ctx.save();
  setContext && initTextContext(ctx, textStyle);
  const size = ctx.measureText(text);
  textSizeLRUMap.set(cacheKey, size);
  setContext && ctx.restore();
  return size;
}

function initTextContext(ctx: CanvasRenderingContext2D, textStyle: TextConf = {}) {
  const { fontFamily = 'sans-serif', fontSize = 12, fontWeight = 'normal', fontStyle = 'normal' } = textStyle;
  styleHelper.setFontStyle(ctx, {
    fontFamily,
    fontWeight,
    fontSize,
    fontStyle,
  })
}
function getCacheKey(text: string, textStyle: TextConf): string {
  const { fontFamily = 'sans-serif', fontSize = 10, fontWeight = 'normal', fontStyle = 'normal' } = textStyle;
  return [text, fontSize, fontFamily, fontWeight, fontStyle].join('__$$__');
}