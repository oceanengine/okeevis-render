import Shape from './Shape';
import  {CommonAttr, } from './Element';
import Path2D from '../geometry/Path2D';

export interface PathConf extends CommonAttr {
  pathData?: Path2D;
}

export default class Path extends Shape<PathConf> {
  public type = 'path';

  public static fromSvgPath(inputPath: string): Path {
    return new Path({
      pathData: new Path2D(inputPath),
    })
  }

  public getAnimationKeys(): Array<keyof PathConf> {
    return [
      ...super.getAnimationKeys(),
     'pathData',
    ];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    if (this.attr.pathData) {
      this.attr.pathData.drawOnCanvasContext(ctx);
    }
  }
  
}