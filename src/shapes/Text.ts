import Shape from './Shape';
import { CommonAttr } from './Element';
import * as lodash from '../utils/lodash';
import { BBox, inBBox } from '../utils/bbox';
import { measureText } from '../utils/measureText';

export interface TextConf extends CommonAttr {
  x?: number;
  y?: number;
  maxWidth?: number;
  text?: string | number;
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
    ellipsis?: string;
  };
}
export const shapeKeys: Array<keyof TextConf> = [
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

  public shapeKeys = shapeKeys;
  
  private _isOverflow: boolean = false;

  private get _isEmpty(): boolean {
    const { text } = this.attr;
    if (text === undefined || text === null || text === '') {
      return true;
    }
    return false;
  }

  private get isMutiLine(): boolean {
    const { text, truncate } = this.attr;
    return !!((text + '').indexOf('\n') !== -1 || truncate);
  }

  public getDefaultAttr(): TextConf {
    return {
      ...super.getDefaultAttr(),
      text: '',
      x: 0,
      y: 0,
    };
  }

  public getAnimationKeys(): Array<keyof TextConf> {
    return [...super.getAnimationKeys(), 'x', 'y', 'fontSize'];
  }

  public getSpanList(): TextSpan[] {
    const out: TextSpan[] = [];
    this.eachSpanList((text, x, y) => out.push({ x, y, text }));
    return out;
  }

  public eachSpanList(callback: (text: string, x: number, y: number) => void) {
    const { x, y } = this.attr;
    const { fontSize, lineHeight, textBaseline } = this.getTextStyle();
    const textList = this._getInlineTextList();
    const gap  = (lineHeight - fontSize) / 2;;
    textList.forEach((rowText, rowIndex) => {
      let rowY: number = y;
      if (textBaseline === 'top') {
        rowY = y + rowIndex * lineHeight + gap;
      } else if (textBaseline === 'middle') {
        rowY = y + (rowIndex + 0.5 - textList.length / 2) * lineHeight;
      } else if (textBaseline === 'bottom') {
        rowY = y - (textList.length - 1 - rowIndex) * lineHeight - gap;
      }
      callback(rowText, x, rowY);
    });
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const { text: _text } = this.attr;
    if (this._isEmpty) {
      return;
    }
    // ctx.save();
    // ctx.arc(this.attr.x, this.attr.y, 4, 0 , Math.PI * 2);
    // ctx.fillStyle = 'red';
    // ctx.fill();
    // ctx.restore();
    const text = _text + '';
    const { needFill, needStroke } = this;

    if (!this.isMutiLine) {
      if (needStroke && ctx.strokeText) {
        if (this.attr.maxWidth > 0) {
          ctx.strokeText(text, this.attr.x, this.attr.y, this.attr.maxWidth);
        } else {
          ctx.strokeText(text, this.attr.x, this.attr.y);
        }
      }
      if (needFill) {
        if (this.attr.maxWidth > 0) {
          ctx.fillText(text, this.attr.x, this.attr.y, this.attr.maxWidth);
        } else {
          ctx.fillText(text, this.attr.x, this.attr.y);
        }
      }
      return;
    }
    this.eachSpanList((rowText, x, y) => {
      if (needStroke && ctx.strokeText) {
        if (this.attr.maxWidth > 0) {
          ctx.strokeText(rowText, x, y, this.attr.maxWidth);
        } else {
          ctx.strokeText(rowText, x, y);
        }
      }
      if (needFill) {
        if (this.attr.maxWidth > 0) {
          ctx.fillText(rowText, x, y, this.attr.maxWidth);
        } else {
          ctx.fillText(rowText, x, y);
        }
      }
    });
  }

  protected measureText(): {width: number; height: number} {
    const textStyle = this.getTextStyle();
    const text = this._isEmpty ? '' : this.attr.text + '';
    return measureText(text, textStyle);
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
    if (this._isEmpty) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    const { x, y } = this.attr;
    const textStyle = this.getTextStyle();
    const { fontSize, textAlign, textBaseline, lineHeight } = textStyle;
    let textWidth: number;
    let textHeight: number;

    if (!this.isMutiLine) {
      textWidth = measureText(this.attr.text + '', textStyle).width;
      textHeight = fontSize;
    } else {
      const inlineTextList = this._getInlineTextList();
      textHeight = inlineTextList.length * lineHeight;
      textWidth = lodash.max(inlineTextList.map(text => measureText(text, textStyle).width)) || 0;
    }

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

  protected isPointOnPath(x: number, y: number): boolean {
    return inBBox(this.getBBox(), x, y);
  }

  protected onEvent(type: string, ...params: any[]) {
    super.onEvent(type, ...params);
    if (this._isOverflow && this.ownerRender.isBrowser()) {
      if (type === 'mouseenter') {
        this.ownerRender.getDom().title = this.attr.text + '';
      }
      if (type === 'mouseleave') {
        this.ownerRender.getDom().removeAttribute('title');
      }
    }
  }

  public getSvgAttributes() {
    let anchor: 'start' | 'end' | 'middle';
    let dy = 0;
    const textStyle = this.getTextStyle();
    if (textStyle.textBaseline === 'bottom') {
      dy = -textStyle.fontSize / 2 + textStyle.fontSize / 10;
    } else if (textStyle.textBaseline === 'top') {
      dy = textStyle.fontSize / 2 + textStyle.fontSize / 10;
    } else if (textStyle.textBaseline === 'middle') {
      dy = +textStyle.fontSize / 10;
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

    const ret = {
      ...super.getSvgAttributes(),
      x: this.attr.x,
      y: this.attr.y,
      dy,
      'dominant-baseline': 'middle',
      'text-anchor': anchor,
      'paint-order': 'stroke',
    };
    if (this.attr.maxWidth > 0) {
      ret.textLength = this.attr.maxWidth;
    }
    return ret;
  }

  private _getInlineTextList(): string[] {
    this._isOverflow = false;
    const { text: _text, truncate } = this.attr;
    const textStyle = this.getTextStyle();
    const { lineHeight } = textStyle;
    if (this._isEmpty) {
      return [];
    }
    const text = _text + '';
    if (!truncate) {
      return text.split('\n');
    }
    const textList = text.split('');
    const rowTextList = [];
    const { outerWidth, outerHeight, ellipsis = '...' } = truncate;
    const ellipseWidth = measureText(ellipsis, textStyle).width;

    if (lodash.isNumber(outerHeight) && outerHeight < lineHeight) {
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
        rowTextList[rowIndex] = tempStr + ellipsis;
        this._isOverflow = true;
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
