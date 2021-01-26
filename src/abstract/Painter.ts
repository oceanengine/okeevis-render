

export default abstract class Painter {

  public abstract resize(width: number, height: number): void;

  public abstract onFrame(now?: number): void;

  public abstract getBase64(): string;

  public abstract getContext(): CanvasRenderingContext2D;

  public abstract dispose(): void;
}