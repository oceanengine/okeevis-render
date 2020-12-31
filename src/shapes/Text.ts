import Shape from './Shape';
import { CommonAttr } from './Element';

export interface TextConf extends CommonAttr {
  x?: number;
  y?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  fontVariant?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  // todo truncate
}

export default class Text extends Shape<TextConf> {
  public type = 'text';

  public brush(ctx: CanvasRenderingContext2D) {
    const {x, y, text} = this.attr;
    ctx.fillText(text, x, y);
  }
}
