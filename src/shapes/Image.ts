import Shape from './Shape';
import { CommonAttr } from './Element';
import { getImage } from '../utils/imageLoader';
import { BBox, rectBBox, inBBox, alignBox, BoxAlign, BoxVerticalAlign } from '../utils/bbox';


export interface ImageConf extends CommonAttr {
  x?: number;
  y?: number;
  // 只有一个时自适应宽高,参照小程序规则
  // 注意ie下兼容性,domImage先append 后remove
  width?: number;
  height?: number;
  src?: string;
  /**
   * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/preserveAspectRatio
   */
  preserveAspectRatio?: 'none' | 'xMinYMin' | 'xMidYMin' | 'xMaxYMin' | 'xMinYMid' | 'xMidYMid' | 'xMaxYMid' | 'xMinYMax' | 'xMidYMax' | 'xMaxYMax';
}

const boxAlign: Record<Exclude<ImageConf['preserveAspectRatio'], 'none'>, [BoxAlign, BoxVerticalAlign]> = {
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

const shapeKeys: Array<keyof ImageConf> = ['x', 'y', 'width', 'height', 'src'];

export default class Image extends Shape<ImageConf> {
  public type = 'image';

  public svgTagName = 'image';

  public fillAble = false;

  public strokeAble = false;

  public shapeKeys = shapeKeys;

  public getAnimationKeys(): Array<keyof ImageConf> {
    return [...super.getAnimationKeys(), 'x', 'y', 'width', 'height'];
  }

  public getDefaultAttr(): ImageConf {
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
    const image = getImage(src, () => {
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
          0, 0, image.width, image.height,
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
      "xlink:href": this.attr.src,
      'preserveAspectRatio': this.attr.preserveAspectRatio || 'none',
    }
  }

  protected computeBBox(): BBox {
    const { src, x, y, width, height } = this.attr;
    const image = getImage(src);
    const sw = width > 0 ? width : image?.width || 0;
    const sh = height > 0 ? height : image?.height || 0;
    return rectBBox(x, y, sw, sh);
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
    // 横向缩放，纵向铺满
    if (width / height > imageWidth / imageHeight) {
      outWidth = height *  imageWidth / imageHeight;
    } else {
      outHeight = width * imageHeight / imageWidth;
    }
    const { x: imageX, y: imageY } = alignBox({ x, y, width, height }, outWidth, outHeight, align, verticalAlign);
    return { x: imageX, y: imageY, width: outWidth, height: outHeight };
  }


}
