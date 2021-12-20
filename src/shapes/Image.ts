import Shape from './Shape';
import { CommonAttr } from './Element';
import { getImage } from '../utils/imageLoader';
import { BBox, rectBBox, inBBox, alignBox, BoxAlign, BoxVerticalAlign } from '../utils/bbox';

export interface ImageAttr extends CommonAttr {
  x?: number;
  y?: number;
  // ie support, must append to body first
  width?: number;
  height?: number;
  src?: string;
  /**
   * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/preserveAspectRatio
   */
  preserveAspectRatio?:
    | 'none'
    | 'xMinYMin'
    | 'xMidYMin'
    | 'xMaxYMin'
    | 'xMinYMid'
    | 'xMidYMid'
    | 'xMaxYMid'
    | 'xMinYMax'
    | 'xMidYMax'
    | 'xMaxYMax';
}

const boxAlign: Record<
  Exclude<ImageAttr['preserveAspectRatio'], 'none'>,
  [BoxAlign, BoxVerticalAlign]
> = {
  xMinYMin: ['left', 'top'],
  xMidYMin: ['center', 'top'],
  xMaxYMin: ['right', 'top'],
  xMinYMid: ['left', 'middle'],
  xMidYMid: ['center', 'middle'],
  xMaxYMid: ['right', 'middle'],
  xMinYMax: ['left', 'bottom'],
  xMidYMax: ['center', 'bottom'],
  xMaxYMax: ['right', 'bottom'],
};

const shapeKeys: Array<keyof ImageAttr> = ['x', 'y', 'width', 'height', 'src'];

export default class Image extends Shape<ImageAttr> {
  public type = 'image';

  public svgTagName = 'image';

  public fillAble = false;

  public strokeAble = false;

  public shapeKeys = shapeKeys;

  public getAnimationKeys(): Array<keyof ImageAttr> {
    return [...super.getAnimationKeys(), 'x', 'y', 'width', 'height'];
  }

  public getDefaultAttr(): ImageAttr {
    return {
      ...super.getDefaultAttr(),
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const { src, preserveAspectRatio } = this.attr;
    if (!src) {
      return;
    }
    const image = getImage(src, this.id, () => {
      this.dirty();
    });
    if (image) {
      const { x, y, width, height } = this._getImagePosition(image);
      if (width === 0 || height === 0) {
        return;
      }
      if (image.width && image.height && preserveAspectRatio !== 'none') {
        ctx.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          x,
          y,
          width >= 0 ? width : image.width,
          height >= 0 ? height : image.height,
        );
      } else {
        ctx.drawImage(image, x, y, width, height);
      }
    }
  }

  protected isPointOnPath(x: number, y: number): boolean {
    return inBBox(this.getBBox(), x, y);
  }

  public getSvgAttributes(): any {
    return {
      ...super.getSvgAttributes(),
      x: this.attr.x,
      y: this.attr.y,
      width: this.attr.width,
      height: this.attr.height,
      'xlink:href': this.attr.src,
      preserveAspectRatio: this.attr.preserveAspectRatio || 'none',
    };
  }

  protected computeBBox(): BBox {
    const { x, y, width, height } = this.attr;
    return rectBBox(x, y, width, height);
  }

  private _getImagePosition(image: HTMLImageElement): BBox {
    const { x, y, width, height, preserveAspectRatio = 'none' } = this.attr;
    if (!preserveAspectRatio || preserveAspectRatio === 'none' || !image.width || !image.height) {
      return { x, y, width, height };
    }
    const [align, verticalAlign] = boxAlign[preserveAspectRatio];
    const imageWidth = image.width;
    const imageHeight = image.height;
    let outWidth = width;
    let outHeight = height;
    if (width / height > imageWidth / imageHeight) {
      outWidth = (height * imageWidth) / imageHeight;
    } else {
      outHeight = (width * imageHeight) / imageWidth;
    }
    const { x: imageX, y: imageY } = alignBox(
      { x, y, width, height },
      outWidth,
      outHeight,
      align,
      verticalAlign,
    );
    return { x: imageX, y: imageY, width: outWidth, height: outHeight };
  }
}
