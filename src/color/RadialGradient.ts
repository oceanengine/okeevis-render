import Gradient, {GradientOption, } from '../abstract/Gradient';

export interface RadialGradientOption  extends GradientOption {
  cx: number;
  cy: number;
  r: number;
}

export default class RadialGradient implements Gradient<RadialGradientOption> {
  public option: RadialGradientOption;

  public  applyToCanvasContext(ctx: CanvasRenderingContext2D, bbox: BBox) {
    // todo
  }
}