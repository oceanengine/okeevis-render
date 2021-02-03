import Shape from './Shape';
import { CommonAttr } from './Element';
import { getImage } from '../utils/imageLoader';
import { BBox, rectBBox, inBBox, } from '../utils/bbox';

export interface ImageConf extends CommonAttr {
  x?: number;
  y?: number;
  // 只有一个时自适应宽高,参照小程序规则
  // 注意ie下兼容性,domImage先append 后remove
  width?: number;
  height?: number;
  src?: string;
}
const shapeKeys: Array<keyof ImageConf> = ['x', 'y', 'width', 'height', 'src'];

export default class Image extends Shape<ImageConf> {
  public type = 'image';

  public svgTagName = 'image';

  public pickByGPU = false;

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
    const { src, x, y, width, height } = this.attr;
    if (!src) {
      return;
    }
    const image = getImage(src, () => {
      this.dirty();
    });
    image &&
      ctx.drawImage(
        image,
        x,
        y,
        width >= 0 ? width : image.width,
        height >= 0 ? height : image.height,
      );
  }

  public isInShape(x: number, y: number): boolean {
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
      'preserveAspectRatio': 'none',
    }
  }

  protected computeBBox(): BBox {
    const { src, x, y, width, height } = this.attr;
    const image = getImage(src);
    const sw = width > 0 ? width : image?.width || 0;
    const sh = height > 0 ? height : image?.height || 0;
    return rectBBox(x, y, sw, sh);
  }
  
  
}
