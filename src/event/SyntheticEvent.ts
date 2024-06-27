import Element from '../shapes/Element';
export interface SyntheticEventParams {
  original?: any;
  bubbles: boolean;
  timeStamp?: number;
  relatedTarget?: Element;
}

export default class SyntheticEvent<T extends  MouseEvent | TouchEvent | FocusEvent | KeyboardEvent = MouseEvent | TouchEvent> {
  public type: string;

  public syntheticType: string;

  public original: T;

  public isPropagationStopped: boolean;

  public isDefaultPrevented: boolean;

  public bubbles: boolean;

  public timeStamp: number;

  public target: Element;

  public currentTarget: Element;

  public relatedTarget: Element | null = null;

  private _defaultHandle: () => void | undefined;

  public constructor(type: string, params: SyntheticEventParams) {
    this.type = type;
    this.original = params.original;
    this.bubbles = params.bubbles;
    this.timeStamp = params.timeStamp || Date.now();
    this.relatedTarget = params.relatedTarget;
  }

  public preventDefault(): void {
    if (this.original.preventDefault) {
      this.original.preventDefault();
    }
    this.isDefaultPrevented = true;
  }

  public nativePreventDefault(): void {
    if (this.original.preventDefault) {
      this.original.preventDefault();
    }
  }

  public setDefaultHandle(handler: () => void): void {
    if (!this._defaultHandle) {
      this._defaultHandle = handler;
    }
  }

  public runDefaultHandle(): void {
    if (this.isDefaultPrevented) {
      return;
    }
    this._defaultHandle?.();
  }

  public stopPropagation(): void {
    this.isPropagationStopped = true;
  }
}
