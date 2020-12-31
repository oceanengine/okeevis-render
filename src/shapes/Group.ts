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
    this._components.push(item as T);
    item.renderer = this.renderer;
    item.parentNode = this;
    this.dirty();
    return this;
  }
  
  public addAll(items: T[]): this {
    items.forEach(item => this.add(item));
    return this;
  }

  public onFrame(now: number) {
    super.onFrame(now);
    this._components.forEach(item => item.onFrame(now));
  }

  public destroy() {
    super.destroy();
    this._components.forEach(item => {
      item.destroy();
    });
    this._components = [];
  }

  public remove(element: T) {
    element.destroy();
    this._components = this._components.filter(item => item !== element);
    this.dirty();
  }

  public children(): T[] {
    return this._components;
  }
}