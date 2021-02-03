import Shape from './Shape';
import  {CommonAttr, } from './Element';
import Path2D from '../geometry/Path2D';
import { BBox, } from '../utils/bbox';

export interface PathConf extends CommonAttr {
  pathData?: Path2D;
  brush?: (ctx: CanvasRenderingContext2D | Path2D) => void;
}
const shapeKeys: Array<keyof PathConf> = ['pathData', 'brush'];

export default class Path extends Shape<PathConf> {
  public type = 'path';


  public shapeKeys = shapeKeys;

  public static fromSvgPath(inputPath: string, attr?: PathConf): Path {
    return new Path({
      ...attr,
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
    } else if (this.attr.brush) {
      this.attr.brush(ctx);
    }
  }

  protected computeBBox(): BBox {
    return this.attr.pathData?.getPathBBox() || {x: 0, y: 0, width: 0, height: 0}
  }

  protected prevProcessAttr(attr: PathConf) {
    super.prevProcessAttr(attr);
    this._setAttrPathData(attr);
  }

  private _setAttrPathData(attr: PathConf) {
    if (attr && attr.brush) {
      const path = new Path2D()
      attr.brush(path);
      attr.pathData = path;
    }
  }

  public pickByGPU(): boolean {
    return true;
  }
}