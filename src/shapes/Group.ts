import Element from './Element';

export default class Group<T extends Element = Element> extends Element {
  public type = 'group';
  protected _components: T[] = [];
  add(item: Element): this {
    this._components.push(item as T);
    item.renderer = this.renderer;
    item.parentNode = this;
    this.dirty();
    return this;
  }
  
  addAll(items: T[]): this {
    items.forEach(item => this.add(item));
    return this;
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