
import {TextConf, } from '../shapes/Text';

export default abstract class Painter {
  public abstract paint(): void;

  public abstract resize(width: number, height: number): void;

  public abstract onFrame(now: number): void;

  public abstract measureText<T extends string | string[]>(text: T, textStyle: TextConf): T extends string ? TextMetrics : TextMetrics[];

  public abstract dispose(): void;
}