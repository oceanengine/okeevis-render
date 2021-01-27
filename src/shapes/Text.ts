import Shape from './Shape';
import { CommonAttr } from './Element';
import * as lodash from '../utils/lodash';
import { BBox, inBBox } from '../utils/bbox';
import { measureText } from '../utils/measureText';

export interface TextConf extends CommonAttr {
  x?: number;
  y?: number;
  maxWidth?: number;
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
export interface TextSpan {
  x: number;
  y: number;
  dy?: number;
  text: string;
}

export default class Text extends Shape<TextConf> {
  public type = 'text';

  public svgTagName = 'text';

  public pickByGPU = false;

  public shapeKeys = shapeKeys;

  private _inlineTextList: string[];

  public getDefaultAttr(): TextConf {
    return {
      ...super.getDefaultAttr(),
      x: 0,
      y: 0,
    };
  }

  protected dirtyBBox() {
    super.dirtyBBox();
    this._inlineTextList = null;
  }

  public getAnimationKeys(): Array<keyof TextConf> {
    return [...super.getAnimationKeys(), 'x', 'y', 'fontSize'];
  }

  public getSpanList(): TextSpan[] {
    const { x, y } = this.attr;
    const { lineHeight, textBaseline } = this.getTextStyle();
    const textList = this._getInlineTextList();
    return textList.map((rowText, rowIndex) => {
      let rowY: number = y;
      if (textBaseline === 'top') {
        rowY = y + rowIndex * lineHeight;
      } else if (textBaseline === 'middle') {
        rowY = y + (rowIndex + 0.5 -  textList.length / 2) * lineHeight;
      } else if (textBaseline === 'bottom') {
        rowY = y  - (textList.length - 1 - rowIndex) * lineHeight;
      }
      return {
        x,
        y: rowY,
        text: rowText,
      };
    });
  }
  

  public brush(ctx: CanvasRenderingContext2D) {
    const { needStroke, needFill } = this.getFillAndStrokeStyle();
    const spanList = this.getSpanList();
    if (needStroke) {
      spanList.forEach(item => ctx.strokeText(item.text, item.x, item.y, this.attr.maxWidth));
    }
    if (needFill) {
      spanList.forEach(item => ctx.fillText(item.text, item.x, item.y, this.attr.maxWidth));
    }
  }

  protected measureText(): TextMetrics {
    const textStyle = this.getTextStyle();
    return measureText(this.attr.text, textStyle);
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
    const textStyle = this.getTextStyle();
    const { textAlign, textBaseline, lineHeight } = textStyle;
    const inlineTextList = this._getInlineTextList();
    const textHeight = inlineTextList.length * lineHeight;
    let textWidth = lodash.max(inlineTextList.map(text => measureText(text, textStyle).width)) || 0;
    if (this.attr.maxWidth > 0) {
      textWidth = Math.min(textWidth, this.attr.maxWidth);
    }
    const bbox: BBox = {
      x,
      y,
      width: textWidth,
      height: textHeight,
    };

    if (textAlign === 'center') {
      bbox.x = x - textWidth / 2;
    } else if (textAlign === 'right') {
      bbox.x = x - textWidth;
    }

    if (textBaseline === 'top') {
      bbox.y = y;
    } else if (textBaseline === 'middle') {
      bbox.y = y - textHeight / 2;
    } else {
      bbox.y = y - textHeight;
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
      dy = -textStyle.fontSize /  2  + textStyle.fontSize / 10;
    } else if (textStyle.textBaseline === 'top') {
      dy = textStyle.fontSize / 2 + textStyle.fontSize / 10;
    } else if (textStyle.textBaseline === 'middle') {
      dy =  +textStyle.fontSize / 10;
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
      textLength: this.attr.maxWidth,
      'dominant-baseline': 'middle',
      'text-anchor': anchor,
      'paint-order': 'stroke',
    };
  }
  
  private _getInlineTextList(): string [] {
    if (!this._inlineTextList) {
      this._inlineTextList = this._computeInlineTextList();
    }
    return this._inlineTextList;
  }

  private _computeInlineTextList(): string[] {
    if (this._inlineTextList) {
      return this._inlineTextList;
    }
    const { text, truncate } = this.attr;
    const textStyle = this.getTextStyle();
    const { lineHeight } = textStyle;
    if (text === '' || text === null || text === undefined) {
      return [];
    }
    if (!truncate) {
      return text.split('\n');
    }
    const textList = text.split('');
    const rowTextList = [];
    const { outerWidth, outerHeight, ellipse = '...' } = truncate;
    const ellipseWidth = measureText(ellipse, textStyle).width;

    if (outerHeight && outerHeight < lineHeight) {
      return [];
    }

    let rowWidth = 0;
    let rowHeight = lineHeight;
    let rowIndex: number = 0;
    const rowLetterWidthList: number[] = [];
    rowTextList.push('');
    for (let i = 0; i < textList.length; i++) {
      const letter = textList[i];
      if (letter === '\r') {
        continue;
      }
      if (letter === '\n') {
        rowTextList.push('');
        rowIndex++;
        rowWidth = 0;
        rowHeight += lineHeight;
        rowLetterWidthList.length = 0;
        continue;
      }
      const letterWidth = measureText(letter, textStyle).width;
      if (outerWidth && letterWidth + rowWidth <= outerWidth) {
        rowWidth += letterWidth;
        rowLetterWidthList.push(letterWidth);
        rowTextList[rowIndex] += letter;
      } else if (outerHeight && rowHeight + lineHeight > outerHeight) {
        // 变省略号
        let tempWidth = 0;
        let tempStr = '';
        for (let j = 0; j < rowLetterWidthList.length; j++) {
          if (tempWidth + rowLetterWidthList[j] <= outerWidth - ellipseWidth) {
            tempStr += rowTextList[rowIndex][j];
            tempWidth += rowLetterWidthList[j];
          } else {
            break;
          }
        }
        rowTextList[rowIndex] = tempStr + ellipse;
        break;
      } else {
        rowTextList.push(letter);
        rowIndex++;
        rowWidth = letterWidth;
        rowHeight += lineHeight;
        rowLetterWidthList.length = 0;
        rowLetterWidthList.push(letterWidth);
      }
    }
    return rowTextList;
  }
}
