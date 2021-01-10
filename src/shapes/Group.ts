import { diff } from '@egjs/list-differ';
import Element from './Element';
import Shape from './Shape';
import {TextConf, } from './Text';
import { BBox, unionBBox, } from '../utils/bbox';

export interface GroupConf extends TextConf {
  /**
   * 废弃属性, 合并绘制路径,并没有什么用, 但是保留作为测试用.
   */
  _batchBrush?: boolean;
}

export default class Group<T extends Element = Element> extends Element<GroupConf> {
  public type = 'group';

  public fillAble = false;

  public strokeAble = false;

  protected _components: T[] = [];

  public getDefaultAttr(): GroupConf {
    return {
      ...super.getDefaultAttr(),
      _batchBrush: false,
    }
  }

  public getAnimationKeys(): Array<keyof GroupConf> {
    return [
      ...super.getAnimationKeys(),
      'fontSize'
    ]
  }

  protected computeBBox(): BBox {
    const bboxList = this._components.filter(item => item.attr.display).map(child => child.getClientBoundingRect());
    return unionBBox(bboxList);
  }

  public mounted() {
    super.mounted();
    this._components.forEach(item => item.mounted());
  }

  public dirtyTransform() {
    super.dirtyTransform();
    if (this._components) {
      this._components.forEach(child => child.dirtyAbsTransform());
    }
  }

  public add(item: Element): this {
    if (!item) {
      return;
    }
    this._components.push(item as T);
    item.ownerRender = this.ownerRender;
    item.parentNode = this;
    item.mounted();
    this.dirty();
    this.dirtyBBox();
    return this;
  }
  
  public addAll(items: T[]): this {
    items.forEach(item => this.add(item));
    return this;
  }

  public remove(element: T) {
    element.destroy();
    this._components = this._components.filter(item => item !== element);
    this.dirty();
    this.dirtyBBox();
  }

  public clear() {
    this._components.forEach(item => item.destroy());
    this._components = [];
    this.dirty();
    this.dirtyBBox();
  }

  public contain(child: Element): boolean {
    let node = child;
    while (node) {
      if (node === this) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
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

  public updateAll(list: T[]) {
    const prevList = this._components;
    if (prevList.length === 0) {
      this.addAll(list);
      return;
    }
    const result = diff(prevList, list, (item, index) => {
      const attr = item.attr;
      const key = attr.key ? (item.type + attr.key) : `auto-key-${item.type}-${index}`;
      return key;
    });

    result.removed.forEach(index => {
      this.remove(prevList[index]);
    });

    result.ordered.forEach(([from, to], i) => {
      this._components.splice(from, 1)
      this._components.splice(to, 0, list[result.pureChanged[i][1]]);
    });

    result.maintained.forEach(([from, to]) => {
      const prevElement = this._components[from];
      const nextElement = list[to];
      // 相同实例
      if (prevElement === nextElement) {
        return;
      }
      if (nextElement.attr.ref) {
        nextElement.attr.ref.current = prevElement;
      }
      if (prevElement.type === 'group') {
        (prevElement as unknown as Group).updateAll((nextElement as any as Group).children())
      }
      prevElement.setBaseTransform(nextElement.getBaseTransform());
      prevElement.stopAllAnimation().animateTo(nextElement.attr, 10000);
    });

    result.added.forEach(index => {
      this.add(list[index]);
    });
    
  }

  public children(): T[] {
    return this._components.slice();
  }

  public getAllLeafNodes(ret: Shape[] = []): Shape[] {
    this._components.forEach(item => {
      if (item.type !== 'group') {
        ret.push(item as any as Shape);
      } else {
        (item as any as Group).getAllLeafNodes(ret);
      }
    })
    return ret;
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