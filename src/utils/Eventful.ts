
export default class EventFul {
  private _eventListeners: Record<string, Function[]> = {};

  public on(eventName: string, listener: Function): void {
    const listenerList = this._eventListeners[eventName] || [];
    const exsitListener: boolean =
      listenerList.length > 0 && listenerList.some(item => item === listener);
    if (!exsitListener && typeof listener === 'function') {
      listenerList.push(listener);
      this._eventListeners[eventName] = listenerList;
    }
  }

  public off(eventName: string, listener?: Function): void {
    const listenerList = this._eventListeners[eventName] || [];
    if (typeof listener === undefined) {
      delete this._eventListeners[eventName];
    } else if (typeof listener === 'function') {
      const exsitIndex = listenerList.indexOf(listener);
      if (exsitIndex !== -1) {
        listenerList.splice(exsitIndex, 1);
      }
      this._eventListeners[eventName] = listenerList;
    }
  }

  public dispatch(type: string, ...args:any[]): void {
    const listenerList = this._eventListeners[type] || [];
    listenerList.forEach(listener => listener.apply(null, args));
    this.onEvent.apply(null, args);
  }

  public removeAllListeners() {
    this._eventListeners = {};
  }

  protected onEvent(type: string, ...params: any[]) {
    // nothing
  }
}
