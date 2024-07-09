import type Render from '../render';


export abstract class AbstractPlugin<T=unknown> {
  public abstract name: string;

  protected config: T;

  public render: Render;

  public constructor(config = {} as T) {
    this.config = config;
  }

  public abstract init(): void;

  public getConfig(): T {
    return this.config;
  }

  public destroy(): void {
    // empty;
  }
}