import Shape from './Shape';
import { CommonAttr } from './Element';
import * as lodash from '../utils/lodash';
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

  private _inlineTextList: string[];

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

  protected dirtyBBox() {
    super.dirtyBBox();
    this._inlineTextList = this._getInlineTextList();
  }

  public brush(ctx: CanvasRenderingContext2D) {
    if (!this._inlineTextList || this._inlineTextList.length !== 1) {
      return;
    }
    const { x, y } = this.attr;
    const { lineHeight, textBaseline, } = this.getTextStyle();
    const { needStroke, needFill } = this.getFillAndStrokeStyle();
    const renderList = (this._inlineTextList || []).map((rowText, rowIndex) => {
      let rowY: number = y;
      if (textBaseline === 'top') {
        rowY = y + rowIndex * lineHeight;
      } else if (textBaseline === 'middle') {
        rowY =  y + ((rowIndex + 1) -  renderList.length / 2) * lineHeight;
      } else {
        rowY =  y - (renderList.length - rowIndex - 1) * lineHeight; 
      }
      return {
        x,
        y: rowY,
        text: rowText
      };
    });
    if (renderList.length === 0) {
      return;
    }
    if (needStroke) {
      renderList.forEach(item => ctx.strokeText(item.text, item.x, item.y));
    }
    if (needFill) {
      renderList.forEach(item => ctx.fillText(item.text, item.x, item.y));
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
    const { textAlign, textBaseline, lineHeight } = this.getTextStyle();
    const textWidth = this.measureText().width;
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

  private _getInlineTextList(): string[] {
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
        rowTextList[rowIndex] = tempStr;
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
