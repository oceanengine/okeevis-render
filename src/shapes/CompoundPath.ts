import Shape from './Shape';
import { CommonAttr } from './Element';
import { BBox, unionBBox, } from '../utils/bbox';

export interface CompoundPathConf extends CommonAttr {
  paths?: Shape[];
}

const shapeKeys: Array<keyof CompoundPathConf> = ['paths'];

export default class CompoundPath extends Shape<CompoundPathConf> {
  public type = 'compoundPath';

  public shapeKeys = shapeKeys;

  public getDefaultAttr(): CompoundPathConf {
    return {
      ...super.getDefaultAttr(),
     paths: [],
    };
  }

  public getAnimationKeys(): Array<keyof CompoundPathConf> {
    return [...super.getAnimationKeys(), 'paths'];
  }

  public brush(ctx: CanvasRenderingContext2D) {
    this.attr.paths.forEach(path => path.brush(ctx));
  }

  protected computeBBox(): BBox {
    return unionBBox(this.attr.paths.map(path => path.getBBox()));
  }
}
