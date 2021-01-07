import {BBox, } from '../utils/bbox';

export interface ColorStop {
  offset: number;
  color: string;
}
export interface GradientOption {
  stops: ColorStop[];
}
export default abstract class Gradient<T extends GradientOption> {
  public  option: T;
  
  public constructor(option: T) {
    this.option = option;
  }

  public abstract toCssString(): string;

  public abstract getCanvasContextStyle(ctx: CanvasRenderingContext2D, bbox: BBox): CanvasGradient;
  
}
