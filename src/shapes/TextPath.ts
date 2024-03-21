import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox, inBBox, unionBBox, createZeroBBox } from '../utils/bbox';
import { measureText } from '../utils/measureText';
import * as mat3 from '../../js/mat3';
import { transformMat3 } from '../utils/vec2';

export interface TextPathAttr extends CommonAttr {
  text?: string | number;
  path?: Shape;
  fontSize?: number;
  startOffset?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  fontVariant?: string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
}

interface LetterItem {
  char: string;
  offset: number;
  transform: mat3;
  width: number;
  height: number;
}

export const shapeKeys: Array<keyof TextPathAttr> = ['text', 'path', 'fontSize', 'startOffset'];

export default class Text extends Shape<TextPathAttr> {
  public type = 'text';

  public svgTagName = 'textPath';

  public shapeKeys = shapeKeys;

  private _letterList: LetterItem[] = [];

  private _letterListDirty: boolean = true;

  public getAnimationKeys(): Array<keyof TextPathAttr> {
    return [...super.getAnimationKeys(), 'fontSize', 'path', 'startOffset'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const path = this.attr.path;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    const totalLength = path.getTotalLength();
    this.getLetterList().forEach(letter => {
      const { char, offset, transform } = letter;
      if (offset >= totalLength) {
        return;
      }
      ctx.save();
      ctx.transform(
        transform[0],
        transform[1],
        transform[3],
        transform[4],
        transform[6],
        transform[7],
      );
      if (this.needFill) {
        // ctx.fillRect(offset, -letter.height, letter.width, letter.height);
        ctx.fillText(char, offset, 0);
      }
      if (this.needStroke) {
        ctx.strokeText(char, offset, 0);
      }
      ctx.restore();
    });
    ctx.restore();
  }

  protected getLetterList() {
    const { path, startOffset } = this.attr;
    const text = this.attr.text;
    if (!this._letterListDirty) {
      return this._letterList;
    }
    this._letterListDirty = false;
    this._letterList.length = 0;
    if (text) {
      const str = String(text).split('');
      let offset = startOffset || 0;
      str.forEach(char => {
        const measure = measureText(char, this.attr);
        const out = mat3.createVec3();
        const point = path.getPointAtLength(offset);
        mat3.translate(out, out, [point.x, point.y]);
        mat3.rotate(out, out, point.alpha);
        mat3.translate(out, out, [-offset, 0]);
        this._letterList.push({
          char,
          offset,
          width: measure.width,
          height: measure.height,
          transform: out,
        });
        offset += measure.width;
      });
    }
    return this._letterList;
  }

  protected onAttrChange(key: any, value: any, oldValue: any) {
    super.onAttrChange(key, value, oldValue);
    if (shapeKeys.indexOf(key)) {
      this._letterListDirty = true;
    }
  }

  protected computeBBox(): BBox {
    return unionBBox(this.getLetterList().map(item => this.computeBBoxWithTransform(createZeroBBox(), item.offset, -item.height, item.width, item.height, item.transform)));
  }

  protected isPointOnPath(x: number, y: number): boolean {
    return this._letterList.some(item => {
      const out = mat3.createVec3();
      const inverMatrix = mat3.invert(out, item.transform);
      const vec2: [number, number] = [0, 0];
      transformMat3(vec2, [x, y], inverMatrix);
      return inBBox(
        {
          x: item.offset,
          y: -item.height,
          width: item.width,
          height: item.height,
        },
        vec2[0],
        vec2[1],
      );
    });
  }

  public getSvgAttributes() {
    return {};
  }
}
