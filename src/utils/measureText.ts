import { TextConf } from '../shapes/Text';
import LRUMap from './LRU';
import * as styleHelper from '../canvas/style';

const textSizeLRUMap = new LRUMap<TextMetrics>(3000);

export  function measureTextList(textList: string[], textStyle: TextConf = {}, ctx: CanvasRenderingContext2D): TextMetrics[] {
  ctx.save();
  initTextContext(ctx, textStyle);
  const sizeList = textList.map(text => measureText(text, textStyle, ctx, false))
  ctx.restore();
  return sizeList;
}

export  function measureText(text: string, textStyle: TextConf = {}, ctx: CanvasRenderingContext2D, setContext = true): TextMetrics {
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