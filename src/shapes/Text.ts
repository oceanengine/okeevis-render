import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox } from '../utils/bbox';
import measureText from '../utils/measureText';

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
const shapeKeys: Array<keyof TextConf> = [
  'x',
  'y',
  'text',
  'truncate',
  'textAlign',
  'textBaseline',
  'fontFamily',
  'fontWeight',
];

export default class Text extends Shape<TextConf> {
  public type = 'text';

  public shapeKeys = shapeKeys;

  public getDefaultAttr(): TextConf {
    return {
      ...super.getDefaultAttr(),
      x: 0,
      y: 0,
    };
  }

  public getAnimationKeys(): Array<keyof TextConf> {
    return [...super.getAnimationKeys(), 'x', 'y', 'fontSize'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const { x, y, text } = this.attr;
    const { needStroke, needFill } = this.getFillAndStrokeStyle();
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

  public measureText(ctx: CanvasRenderingContext2D): TextMetrics {
   return measureText(ctx, this.attr.text, this.getTextStyle());
  }

  public getTextStyle(): TextConf {
    return {
      fontSize: this.getExtendAttr('fontSize'),
      fontFamily: this.getExtendAttr('fontFamily'),
      fontWeight: this.getExtendAttr('fontWeight'),
    };
  }

  protected computeBBox(): BBox {
    const { x, y } = this.attr;
    const fontSize = this.getExtendAttr('fontSize');
    if (this.ownerRender) {
      const painter = this.ownerRender.getPainter();
      const result = this.measureText(painter.getContext());
      return {
        x,
        y,
        width: result.width,
        height: fontSize,
      };
    }
    return {
      x,
      y,
      width: 0,
      height: 0,
    }
    
  }
}
