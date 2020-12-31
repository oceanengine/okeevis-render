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

export default class Rect extends Shape<ImageConf> {
  public type = 'image';
  
  public fillAble = false;

  public strokeAble = false;

  public getAnimationKeys(): Array<keyof ImageConf> {
    return [
      ...super.getAnimationKeys(),
      'x',
      'y',
      'width',
      'height',
    ];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    const { src, x, y, width, height } = this.attr;
    const image = getImage(src, () => {
      this.dirty();
    });
    image && ctx.drawImage(image, x, y, width >= 0 ? width : image.width, height >= 0 ? height : image.height);
  }
}
