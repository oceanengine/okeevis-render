import { diff } from '@egjs/list-differ';
import Element from './Element';
import Shape from './Shape';
import {TextConf, } from './Text';
import { BBox, unionBBox, ceilBBox, } from '../utils/bbox';
import * as lodash from '../utils/lodash';

export interface GroupConf extends TextConf {
  /**
   * 废弃属性, 合并绘制路径,并没有什么用, 但是保留作为测试用.
   */
  _batchBrush?: boolean;
}

export interface ChunkItem {
  parent: Group;
  chunks: Element[][];
}

export default class Group<T extends Element = Element> extends Element<GroupConf> {
  public type = 'group';

  public fillAble = false;

  public strokeAble = false;
  
  protected _components: T[] = [];

  protected _chunks: T[][] = [];

  private _zindexDirty: boolean = true;

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

  public computClientBoundingRect(): BBox {
    return this.getBBox();
  }

  protected computeBBox(): BBox {
    const bboxList = this._components.filter(item => item.attr.display).map(child => child.getClientBoundingRect());
    return unionBBox(bboxList);
  }
  
  protected computeDirtyRect(): BBox {
    const bboxList =  lodash.flatten(this._components.filter(item => item.attr.display).map(child => child.getDirtyRects()));
    return ceilBBox(unionBBox(bboxList));
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
    this.dirty(item);
    this.dirtyBBox();
    return this;
  }
  
  public addAll(items: T[]): this {
    items.forEach(item => this.add(item));
    return this;
  }

  public addChunk(items: T[] = []): this {
    if (items.length === 0) {
      return;
    }
    this._chunks.push(items);
    return this;
  }

  public getChunks(): T[][] {
    return this._chunks;
  }

  // 递归获取chunks
  public getAllChunks(out: ChunkItem[] = []): ChunkItem[] {
    if (this._chunks.length > 0) {
      out.push({
        parent: this,
        chunks: this._chunks,
      });
    }
    this.children().forEach(child => {
      if (child.isGroup) {
        const childGroup = child as any as Group;
        childGroup.getAllChunks(out);
      }
    })
    return out;
  }
  
  public mountChunk(chunkItems: T[]) {
    this._chunks = this._chunks.filter(chunk => chunk !== chunkItems);
    chunkItems.forEach(item => item.clearDirty());
    chunkItems.forEach(item => {
      item.parentNode = this;
      item.mounted();
    });
    this.dirtyBBox();
    this._components = this._components.concat(chunkItems);
  }

  public remove(element: T) {
    element.destroy();
    this._components = this._components.filter(item => item !== element);
    this.dirty(element);
    this.dirtyBBox();
  }

  public clear() {
    this._components.forEach(item => item.destroy());
    this._components = [];
    this._chunks = [];
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
    // todo 优化脏区策略, 只脏本group,不脏子元素
    // todo 同步chunks
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
      if (prevElement.isGroup) {
        (prevElement as unknown as Group).updateAll((nextElement as any as Group).children());
        const chunks = (nextElement as any as Group).getChunks();
        chunks.forEach(chunk => (prevElement as any as Group).addChunk(chunk));
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

  public getAllLeafNodes(ret: Shape[] = [], ignoreInvisible = false): Shape[] {
    this._components.forEach(item => {
      if (item.attr.display === false) {
        return;
      }
      if (!item.isGroup) {
        ret.push(item as any as Shape);
      } else {
        (item as any as Group).getAllLeafNodes(ret, ignoreInvisible);
      }
    })
    return ret;
  }

  public resetPickRGB() {
    super.resetPickRGB();
    this._components.forEach(child => child.resetPickRGB());
  }

  public dirtyZIndex() {
    this._zindexDirty = true;
  }

  public sortByZIndex() {
    // todo 未改变的情况下不排序;
    if (this._zindexDirty) {
      this._components = this._components.sort((a, b) => b.attr.zIndex - a.attr.zIndex);
    }
    this._components.forEach((item) => {
      if (item.isGroup) {
        (item as any as Group).sortByZIndex();
      }
    });
    this._zindexDirty = false;
  }
}