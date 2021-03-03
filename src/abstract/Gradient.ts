import { BBox } from '../utils/bbox';
import SVGNode from './Node';

// todo 支持全局坐标系的gradient, 此时不用切换上下文

export interface ColorStop {
  offset: number;
  color: string;
}
export interface GradientOption {
  stops: ColorStop[];
}


let id: number = 1;

export default abstract class Gradient<T extends GradientOption = any> {
  public abstract type: string;

  public id: string;

  public option: T;

  public constructor(option: T) {
    this.option = option;
    this.id = 'lightcharts-gradient-' + id++;
  }

  public abstract clone(): Gradient<T>;

  public abstract toString(): string;

  public abstract getCanvasContextStyle(ctx: CanvasRenderingContext2D, bbox: BBox): CanvasGradient;

  public abstract getSVGNode(): SVGNode;

}
