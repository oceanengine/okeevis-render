import Gradient, {GradientOption, } from '../abstract/Gradient';
import {BBox, } from '../utils/bbox';

export interface LinearGradientOption  extends GradientOption {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default class LinearGradient implements Gradient<LinearGradientOption> {
  public option: LinearGradientOption;

  public  applyToCanvasContext(ctx: CanvasRenderingContext2D, bbox: BBox) {
    // todo
  }

}