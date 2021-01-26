import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox, inBBox } from '../utils/bbox';
import { measureText } from '../utils/measureText';

export interface TextConf extends CommonAttr {
  x?: number;
  y?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  fontVariant?: string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  lineHeight?: number;
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
  'fontSize',
  'fontFamily',
  'truncate',
  'textAlign',
  'textBaseline',
  'fontWeight',
];

export default class Text extends Shape<TextConf> {
  public type = 'text';

  public svgTagName = 'text';

  public pickByGPU = false;

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

  protected measureText(ctx: CanvasRenderingContext2D): TextMetrics {
    const textStyle = this.getTextStyle();
    return measureText(this.attr.text, textStyle, ctx);
  }

  public getTextStyle(): TextConf {
    const fontSize = this.getExtendAttr('fontSize');
    return {
      fontSize,
      fontFamily: this.getExtendAttr('fontFamily'),
      fontWeight: this.getExtendAttr('fontWeight'),
      textAlign: this.getExtendAttr('textAlign'),
      textBaseline: this.getExtendAttr('textBaseline'),
      lineHeight: this.attr.lineHeight || fontSize,
    };
  }

  protected computeBBox(): BBox {
    const { x, y } = this.attr;
    const { textAlign, textBaseline, lineHeight } = this.getTextStyle();
    let textWidth = 0;
    if (this.ownerRender) {
      const painter = this.ownerRender.getPainter();
      const result = this.measureText(painter.getContext());
      textWidth = result.width;
    }
    const bbox: BBox = {
      x,
      y,
      width: textWidth,
      height: lineHeight,
    };

    if (textAlign === 'center') {
      bbox.x = x - textWidth / 2;
    } else if (textAlign === 'right') {
      bbox.x = x - textWidth;
    }

    if (textBaseline === 'top') {
      bbox.y = y;
    } else if (textBaseline === 'middle') {
      bbox.y = y - lineHeight / 2;
    } else {
      bbox.y = y - lineHeight;
    }

    return bbox;
  }

  public isInShape(x: number, y: number): boolean {
    return inBBox(this.getBBox(), x, y);
  }

  public getSvgAttributes() {
    let anchor: 'start' | 'end' | 'middle';
    let dy = 0;
    const textStyle = this.getTextStyle();
    if (textStyle.textBaseline === 'bottom') {
      dy = -textStyle.fontSize / 2;
    } else if (textStyle.textBaseline === 'top') {
      dy = textStyle.fontSize / 2;
    }

    if (textStyle.textAlign === 'start' || textStyle.textAlign === 'left') {
      anchor = 'start';
    }
    if (textStyle.textAlign === 'right' || textStyle.textAlign === 'end') {
      anchor = 'end';
    }
    if (textStyle.textAlign === 'center') {
      anchor = 'middle';
    }

    return {
      ...super.getSvgAttributes(),
      x: this.attr.x,
      y: this.attr.y,
      dy,
      'dominant-baseline': 'middle',
      'text-anchor': anchor,
      'paint-order': 'stroke',
    };
  }
}
