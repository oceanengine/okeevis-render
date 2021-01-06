


export default class  SyntheticEvent<T extends MouseEvent | TouchEvent> {
  public type: string;

  public original: T;

  public isPropagationStopped: boolean;

  // public isDefaultPrevented: boolean;

  public bubbles: boolean;
  
  public timeStamp: number;

  public stopPropagation(): void {
    this.isPropagationStopped = true;
  }
  
}