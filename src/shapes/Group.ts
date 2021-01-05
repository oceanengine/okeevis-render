import { diff } from '@egjs/list-differ';
import Element from './Element';
import {TextConf, } from './Text';

export interface GroupConf extends TextConf {
  useGroupContext?: boolean;
}

export default class Group<T extends Element = Element> extends Element<GroupConf> {
  public type = 'group';

  public fillAble = false;

  public strokeAble = false;

  protected _components: T[] = [];

  public add(item: Element): this {
    if (!item) {
      return;
    }
    this._components.push(item as T);
    item.renderer = this.renderer;
    item.parentNode = this;
    item.mounted();
    this.dirty();
    return this;
  }
  
  public addAll(items: T[]): this {
    items.forEach(item => this.add(item));
    return this;
  }

  public clear() {
    this._components.forEach(item => item.destroy());
    this._components = [];
  }

  public onFrame(now: number) {
    super.onFrame(now);
    this.sortByZIndex();
    this._components.forEach(item => item.onFrame(now));
  }

  public destroy() {
    super.destroy();
    this._components.forEach(item => {
      item.destroy();
    });
    this._components = [];
  }

  public updateChildren(list: Element[]) {
    const prevList = this._components;
    const result = diff(prevList, list, (item, index) => {
      const attr = item.attr;
      const key = attr.key ? (attr.type + attr.key) : `auto-key-${item.type}-${index}`;
      return key;
    });

    result.removed.forEach(index => {
      this.remove(prevList[index]);
    });

    result.ordered.forEach(([from, to], i) => {
      this._components.splice(from, 1)
      this._components.splice(to, 0, list[result.pureChanged[i][1]] as any);
    });

    result.maintained.forEach(([from, to]) => {
      const prevElement = this._components[from];
      const nextElement = list[to];
      if (nextElement.attr.ref) {
        nextElement.attr.ref.current = prevElement;
      }
      this._components[from].stopAllAnimation().animateTo(nextElement.attr, 10000);
      if (prevElement.type === 'group') {
        (prevElement as unknown as Group).updateChildren((nextElement as Group).children())
      }
    });

    result.added.forEach(index => {
      this.add(list[index]);
    });
    
  }

  public remove(element: T) {
    element.destroy();
    this._components = this._components.filter(item => item !== element);
    this.dirty();
  }

  public children(): T[] {
    return this._components;
  }

  public sortByZIndex() {
    this._components = this._components.sort((a, b) => b.attr.zIndex - a.attr.zIndex);
    this._components.forEach((item) => {
      if (item.type === 'group') {
        (item as any as Group).sortByZIndex();
      }
    })
  }
}