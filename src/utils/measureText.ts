import * as lodash from './lodash';
import { TextConf } from '../shapes/Text';
import LRUMap from './LRU';

const textSizeLRUMap = new LRUMap<TextMetrics>(3000);

export default function measureText<T extends string | string[]>(
  ctx: CanvasRenderingContext2D,
  text: T,
  textStyle: TextConf = {},
): T extends string ? TextMetrics : TextMetrics[] {
  const { fontFamily = 'sans-serif', fontSize = 10, fontWeight = 'normal', fontStyle = 'normal' } = textStyle;
  let ret: T extends string ? TextMetrics : TextMetrics[];
  
  if (lodash.isArray(text)) {
    const textList = text as string[];
    ret = textList.forEach((textItem) => getCacheSize(textItem, textStyle)) as any;
  } else {
    const cacheSize = getCacheSize(text as string, textStyle)as any;
    if (cacheSize) {
      return cacheSize 
    }
  }
  
  ctx.save();
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  if (lodash.isArray(text)) {
    ret = text.map((item, index) => {
      if ((ret as any)[index]) {
        return (ret as TextMetrics[])[index];
      } 
      const size = getCacheSize(item, textStyle);
      const key = getCacheKey(item, textStyle);
      textSizeLRUMap.set(key, size);
      return size;
    }) as any;
  } else {
    ret = ctx.measureText(text + '') as any;
    textSizeLRUMap.set(getCacheKey(text as string, textStyle), ret as TextMetrics);
  }
  ctx.restore();
  return ret;
}

function getCacheSize(text: string, textStyle: TextConf): TextMetrics {
  const cacheKey = getCacheKey(text, textStyle);
  return textSizeLRUMap.get(cacheKey);
}
function getCacheKey(text: string, textStyle: TextConf): string {
  const { fontFamily = 'sans-serif', fontSize = 10, fontWeight = 'normal', fontStyle = 'normal' } = textStyle;
  return [text, fontSize, fontFamily, fontWeight, fontStyle].join('__$$__');
}