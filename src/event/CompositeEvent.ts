


export default class  CompositeEvent<T extends MouseEvent | TouchEvent> {
  public type: string;

  public original: T;

  public stopped: boolean;

  public bubble: boolean;

  public stopPropagation(): void {
    this.stopped = true;
  }
  
}