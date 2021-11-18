export interface SyntheticEventParams {
  original?: any;
  bubbles: boolean;
  timeStamp?: number;
}

export default class SyntheticEvent<T extends MouseEvent | TouchEvent = MouseEvent | TouchEvent> {
  public type: string;

  public syntheticType: string;

  public original: T;

  public isPropagationStopped: boolean;

  // public isDefaultPrevented: boolean;

  public bubbles: boolean;

  public timeStamp: number;

  public constructor(type: string, params: SyntheticEventParams) {
    this.type = type;
    this.original = params.original;
    this.bubbles = params.bubbles;
    this.timeStamp = params.timeStamp || Date.now();
  }

  public preventDefault(): void {
    if (this.original.preventDefault) {
      this.original.preventDefault();
    }
  }

  public stopPropagation(): void {
    this.isPropagationStopped = true;
  }
}
