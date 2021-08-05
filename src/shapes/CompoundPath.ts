import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox, unionBBox } from '../utils/bbox';
import Path2D from '../geometry/Path2D';

export interface CompoundPathConf extends CommonAttr {
  shapes?: Shape[];
  pathData?: Path2D;
  closePath?: boolean;
}

const shapeKeys: Array<keyof CompoundPathConf> = ['shapes', 'pathData'];

export default class CompoundPath extends Shape<CompoundPathConf> {
  public type = 'compoundPath';

  public shapeKeys = shapeKeys;

  public getDefaultAttr(): CompoundPathConf {
    return {
      ...super.getDefaultAttr(),
      shapes: [],
      closePath: false,
    };
  }

  public getAnimationKeys(): Array<keyof CompoundPathConf> {
    return [...super.getAnimationKeys(), 'pathData'];
  }

  public prevProcessAttr(attr: CompoundPathConf) {
    super.prevProcessAttr(attr);
    if (attr.shapes && attr.shapes.length > 0) {
      const path = new Path2D();
      attr.shapes.forEach(shape => {
        const nextPath = new Path2D();
        shape.brush(nextPath as any);
        path.connectPath(nextPath);
      });
      attr.pathData = path;
    }
  }

  public brush(ctx: CanvasRenderingContext2D) {
    if (this.attr.pathData) {
      this.attr.pathData.drawOnCanvasContext(ctx);
    } else {
      this.attr.shapes.forEach(path => path.brush(ctx));
    }
    this.attr.closePath && ctx.closePath();
  }

  protected computeBBox(): BBox {
    if (!this.attr.pathData) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    return this.attr.pathData.getPathBBox();
  }

  public pickByGPU(): boolean {
    return true;
  }
}
