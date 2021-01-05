export interface ColorStop {
  offset: number;
  color: string;
}
export default abstract class Gradient {
  public abstract colorStops: ColorStop[];

  public abstract applyToCanvasContext(ctx: CanvasRenderingContext2D): void;
}
