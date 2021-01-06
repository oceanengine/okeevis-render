import Shape from './Shape';
import { CommonAttr } from './Element';
import { getImage } from '../utils/imageLoader';

export interface ImageConf extends CommonAttr {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  src?: string;
}
const shapeKeys: Array<keyof ImageConf> = ['x', 'y', 'width', 'height', 'src'];

export default class Rect extends Shape<ImageConf> {
  public type = 'image';
  
  public fillAble = false;

  public strokeAble = false;

  public shapeKeys = shapeKeys;

  public getAnimationKeys(): Array<keyof ImageConf> {
    return [
      ...super.getAnimationKeys(),
      'x',
      'y',
      'width',
      'height',
    ];
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
    image && ctx.drawImage(image, x, y, width >= 0 ? width : image.width, height >= 0 ? height : image.height);
  }
  
}
