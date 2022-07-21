interface DefaultEventHandle {
  [key: string]: any[];
}

export type Callback<T extends any[]> = (...args: T) => void;

export default class EventFul<T extends DefaultEventHandle = DefaultEventHandle> {
  private _eventListeners: { [P in keyof T]?: Callback<T[P]>[] } = {};

  public on<U extends keyof T>(eventName: U, listener: Callback<T[U]>): void {
    const listenerList = this._eventListeners[eventName] || [];
    const exsitListener: boolean =
      listenerList.length > 0 && listenerList.some(item => item === listener);
    if (!exsitListener && typeof listener === 'function') {
      listenerList.push(listener);
      this._eventListeners[eventName] = listenerList;
    }
  }

  public off<U extends keyof T>(eventName: U, listener?: Callback<T[U]>): void {
    const listenerList = this._eventListeners[eventName] || [];
    if (typeof listener === 'undefined') {
      delete this._eventListeners[eventName];
    } else if (typeof listener === 'function') {
      const exsitIndex = listenerList.indexOf(listener);
      if (exsitIndex !== -1) {
        listenerList.splice(exsitIndex, 1);
      }
      this._eventListeners[eventName] = listenerList;
    }
  }

  public dispatch<U extends keyof T>(type: string, ...args: T[U]): void {
    const listenerList = this._eventListeners[type] || [];
    listenerList.forEach(listener => listener.apply(null, args));
    this.onEvent.apply(this, [type, ...args]);
  }

  public removeAllListeners() {
    this._eventListeners = {};
  }

  // eslint-disable-next-line no-unused-vars
  protected onEvent(type: string, ...params: any[]) {
    // nothing
  }
}
