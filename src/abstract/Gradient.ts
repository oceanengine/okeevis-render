import { BBox } from '../utils/bbox';
import SVGNode from './Node';

export interface ColorStop {
  offset: number;
  color: string;
  
}
export interface GradientOption {
  stops: ColorStop[];
  /** use global coordinate */
  global?: boolean;
}

export type GradientType = 'linearGradient' | 'radialGradient' | 'conicGradient';

let id: number = 1;

export default abstract class Gradient<T extends GradientOption = any> {
  public abstract type: GradientType;

  public isGradient: boolean = true;

  public id: string;

  public option: T;

  public constructor(option: T) {
    this.option = option;
    this.id = 'okee-render-gradient-' + id++;
  }

  public addColorStop(offset: number, color: string) {
    this.option.stops.push({offset, color});
  }

  public abstract clone(): Gradient<T>;

  public abstract toString(): string;

  public abstract getCanvasContextStyle(ctx: CanvasRenderingContext2D, bbox: BBox): CanvasGradient;

  public abstract getSVGNode(): SVGNode;
}
