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
  // todo
  truncate?: {
      outerWidth?: number;
      outerHeight?: number;
      ellipse?: string;
  };
}
const shapeKeys: Array<keyof TextConf> = ['x', 'y', 'text', 'truncate', 'textAlign', 'textBaseline', 'fontFamily', 'fontWeight'];

export default class Text extends Shape<TextConf> {
  public type = 'text';
  
  public shapeKeys = shapeKeys;
  
  public getDefaultAttr(): TextConf {
    return {
      ...super.getDefaultAttr(),
      x: 0,
      y: 0,
    }
  }

  public getAnimationKeys(): Array<keyof TextConf> {
    return[
      ...super.getAnimationKeys(),
      'x',
      'y',
      'fontSize'
    ];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const {x, y, text} = this.attr;
    const {needStroke, needFill, } = this.getFillAndStrokeStyle();
    if (!text) {
      return;
    }
    if (needStroke) {
      ctx.strokeText(text, x, y);
    }
    if (needFill) {
      ctx.fillText(text, x, y);
    }
  }  
}
