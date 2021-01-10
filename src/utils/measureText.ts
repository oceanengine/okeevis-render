import * as lodash from './lodash';
import { TextConf } from '../shapes/Text';

export default function measureText<T extends string | string[]>(
  ctx: CanvasRenderingContext2D,
  text: T,
  textStyle: TextConf = {},
): T extends string ? TextMetrics : TextMetrics[] {
  const { fontFamily = 'sans-serif', fontSize = 10, fontWeight = 'normal' } = textStyle;
  let ret: T extends string ? TextMetrics : TextMetrics[];
  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  if (lodash.isArray(text)) {
    ret = text.map(item => ctx.measureText(item)) as any;
  } else {
    ret = ctx.measureText(text + '') as any;
  }
  ctx.restore();
  return ret;
}
