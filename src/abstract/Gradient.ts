import {BBox, } from '../utils/bbox';

// todo 支持全局坐标系的gradient, 此时不用切换上下文

export interface ColorStop {
  offset: number;
  color: string;
}
export interface GradientOption {
  stops: ColorStop[];
}

export default abstract class Gradient<T extends GradientOption=any> {
  public abstract type: string;

  public  option: T;
  
  public constructor(option: T) {
    this.option = option;
  }

  public abstract toCssString(): string;

  public abstract getCanvasContextStyle(ctx: CanvasRenderingContext2D, bbox: BBox): CanvasGradient;
  
}
