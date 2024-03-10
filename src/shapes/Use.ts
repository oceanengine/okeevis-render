import Shape from './Shape';
import Element, { CommonAttr } from './Element';
import { BBox } from '../utils/bbox';
import CanvasPainter from '../painter/CanvasPainter';

export interface UseAttr extends CommonAttr {
  shape?: Element;
}
const shapeKeys: Array<keyof UseAttr> = ['shape'];

export default class Use extends Shape<UseAttr> {
  public type = 'use';

  public svgTagName = 'use';

  public shapeKeys = shapeKeys;

  public brush(): void {
    (this.ownerRender.getPainter() as CanvasPainter).drawElementInUse(this.attr.shape);
  }

  public mounted() {
    super.mounted();
    this.attr.shape?.addRef(this);
  }

  public destroy() {
    super.destroy();
    this.attr.shape?.removeRef(this);
  }

  public isPointOnPath(x: number, y: number): any {
    return (this.attr.shape as any as this).isPointOnPath(x, y);
  }

  protected computeBBox(): BBox {
    return { ...this.attr.shape.getBBox() };
  }
}
