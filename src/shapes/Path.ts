import Shape from './Shape';
import Element, { CommonAttr } from './Element';
import Path2D from '../geometry/Path2D';
import { BBox } from '../utils/bbox';

export interface PathAttr extends CommonAttr {
  pathData?: Path2D;
  brush?: (ctx: CanvasRenderingContext2D | Path2D) => void;
}
const shapeKeys: Array<keyof PathAttr> = ['pathData', 'brush'];

export default class Path extends Shape<PathAttr> {
  public type = 'path';

  public shapeKeys = shapeKeys;

  public static fromSvgPath(inputPath: string, attr?: PathAttr): Path {
    return new Path({
      ...attr,
      pathData: new Path2D(inputPath),
    });
  }

  public getAnimationKeys(): Array<keyof PathAttr> {
    return [...super.getAnimationKeys(), 'pathData'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    if (this.attr.pathData) {
      this.attr.pathData.drawOnCanvasContext(ctx);
    } else if (this.attr.brush) {
      this.attr.brush(ctx);
    }
  }

  protected computeBBox(): BBox {
    return this.attr.pathData?.getPathBBox() || { x: 0, y: 0, width: 0, height: 0 };
  }

  public isPointInStroke(x: number, y: number, lineWidth: number): boolean {
    return this.getPathData().isPointInStroke(x, y, lineWidth);
  }

  public isPointInFill(x: number, y: number): boolean {
    return this.getPathData().isPointInPath(x, y);
  }

  protected prevProcessAttr(attr: PathAttr) {
    super.prevProcessAttr(attr);
    this._setAttrPathData(attr);
  }

  private _setAttrPathData(attr: PathAttr) {
    if (attr && attr.brush) {
      const path = new Path2D();
      attr.brush(path);
      attr.pathData = path;
    }
  }

}
Element.createPath = () => new Path;
