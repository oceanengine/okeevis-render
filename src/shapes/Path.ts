import Shape from './Shape';
import  {CommonAttr, } from './Element';
import Path2D from '../geometry/Path2D';

export interface PathConf extends CommonAttr {
  pathData?: Path2D;
  brush?: (ctx: CanvasRenderingContext2D | Path2D) => void;
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

  public dirty() {
    super.dirty();
    if (this.attr.brush) {
      const path = new Path2D()
       this.attr.brush(path);
       this.attr.pathData = path;
    }
  }

  public brush(ctx: CanvasRenderingContext2D) {
    if (this.attr.pathData) {
      this.attr.pathData.drawOnCanvasContext(ctx);
    } else if (this.attr.brush) {
      this.attr.brush(ctx);
    }
  }
  
}