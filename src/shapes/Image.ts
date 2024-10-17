import Shape from './Shape';
import { CommonAttr } from './Element';
import { getImage } from '../utils/imageLoader';
import { BBox, rectBBox, inBBox, alignBox, BoxAlign, BoxVerticalAlign } from '../utils/bbox';


export type ImageAlign =  | 'none'
| 'xMinYMin'
| 'xMidYMin'
| 'xMaxYMin'
| 'xMinYMid'
| 'xMidYMid'
| 'xMaxYMid'
| 'xMinYMax'
| 'xMidYMax'
| 'xMaxYMax';

type MeetOrSlice = '' | ' meet' | ' slice';

type ImagePreserveAspectRatio = `${ImageAlign}${MeetOrSlice}`;
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
  preserveAspectRatio?: ImagePreserveAspectRatio;
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
}

const boxAlign: Record<
  Exclude<ImageAlign, 'none'>,
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
      fillOpacity: 1,
      strokeOpacity: 1,
    };
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const { src, crossOrigin, preserveAspectRatio } = this.attr;
    if (!src) {
      return;
    }
    const image = getImage({ src, crossOrigin }, this.id, () => {
      this.dirty();
    });
    if (image) {
      const { x, y, width, height, clip } = this._getImagePosition(image);
      if (width === 0 || height === 0) {
        return;
      }
      if (image.width && image.height && preserveAspectRatio !== 'none') {
        if (clip) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(this.attr.x, this.attr.y, this.attr.width, this.attr.height);
          ctx.clip();
        }
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
        if (clip) {
          ctx.restore();
        }
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

  private _getImagePosition(image: HTMLImageElement): BBox & { clip: boolean } {
    const { x, y, width, height, preserveAspectRatio = 'none' } = this.attr;
    if (!preserveAspectRatio || preserveAspectRatio === 'none' || !image.width || !image.height) {
      return { x, y, width, height, clip: false };
    }
    const [imageAlign, meetOrSlice = 'meet'] = preserveAspectRatio.split(' ');
    const [align, verticalAlign] = boxAlign[imageAlign as keyof typeof boxAlign];
    const imageWidth = image.width;
    const imageHeight = image.height;
    let outWidth = width;
    let outHeight = height;
    if (width / height > imageWidth / imageHeight) {
      outWidth = (height * imageWidth) / imageHeight;
    } else {
      outHeight = (width * imageHeight) / imageWidth;
    }
    let clip = false;
    if (meetOrSlice === 'slice') {
      const scale = Math.max(width / outWidth, height / outHeight);
      outWidth *= scale;
      outHeight *= scale;
      clip = scale > 1;
    }
    const { x: imageX, y: imageY } = alignBox(
      { x, y, width, height },
      outWidth,
      outHeight,
      align,
      verticalAlign,
    );
    return { x: imageX, y: imageY, width: outWidth, height: outHeight, clip };
  }
}
