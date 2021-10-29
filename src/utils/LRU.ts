class Entry<T> {
  public key: string;

  public value: T;

  public tail: Entry<T>;

  public head: Entry<T>;

  public constructor(key: string, value: T) {
    this.key = key;
    this.value = value;
  }
}

export default class LRUMap<T> {
  private _limit: number;

  private _size: number = 0;

  private _tail: Entry<T>;

  private _head: Entry<T>;

  private _keymap: Record<string, Entry<T>> = {};

  public constructor(limit: number) {
    this._limit = limit;
  }

  public get(key: string): T {
    const entry = this._keymap[key];
    if (!entry) {
      return;
    }
    this._moveToHead(entry);
    return entry.value;
  }

  public set(key: string, value: T) {
    let entry = this._keymap[key];
    // update entry
    if (entry) {
      entry.value = value;
      this._moveToHead(entry);
      return;
    }
    // new entry
    entry = new Entry(key, value);
    this._keymap[key] = entry;
    if (this._head) {
      this._head.head = entry;
      entry.tail = this._head;
    } else {
      this._tail = entry;
    }
    this._head = entry;
    ++this._size;
    if (this._size > this._limit) {
      this.shift();
    }
  }

  public shift() {
    // remove tail
    const tailEntry = this._tail;
    if (tailEntry) {
      if (tailEntry.head) {
        this._tail = tailEntry.head;
        this._tail.tail = undefined;
      } else {
        this._tail = this._head = undefined;
      }
      tailEntry.head = tailEntry.tail = undefined;
      delete this._keymap[tailEntry.key];
      --this._size;
    }
  }

  public clear() {
    this._size = 0;
    this._tail = this._head = undefined;
    this._keymap = {};
  }

  private _moveToHead(entry: Entry<T>) {
    if (entry === this._head) {
      return;
    }
    if (entry.head) {
      if (entry === this._tail) {
        this._tail = entry.head;
      }
      entry.head.tail = entry.tail;
    }
    if (entry.tail) {
      entry.tail.head = entry.head;
    }
    entry.head = undefined;
    entry.tail = this._head;
    if (this._head) {
      this._head.head = entry;
    }
    this._head = entry;
  }
}
