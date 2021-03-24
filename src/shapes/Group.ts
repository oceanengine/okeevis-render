import { diff } from '@egjs/list-differ';
import Element, { defaultSetting } from './Element';
import Shape from './Shape';
import { TextConf, shapeKeys } from './Text';
import { BBox, unionBBox, ceilBBox } from '../utils/bbox';
import * as lodash from '../utils/lodash';
import SVGPainter from '../painter/SVGPainter';

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

  public svgTagName = 'g';

  public fillAble = false;

  public strokeAble = false;

  public shapeKeys = shapeKeys;

  private _length: number = 0;

  protected _chunks: T[][] = [];

  public get size(): number {
    return this._length;
  }

  public getDefaultAttr(): GroupConf {
    return {
      ...super.getDefaultAttr(),
      _batchBrush: false,
    };
  }
  
  public onAttrChange(key: any, value: any, oldValue: any) {
    super.onAttrChange(key, value, oldValue);
    if (shapeKeys.indexOf(key) !== -1) {
      this.dirtyTextChildBBox();
    }
  }

  public getAnimationKeys(): Array<keyof GroupConf> {
    return [...super.getAnimationKeys(), 'fontSize'];
  }

  public computeBoundingClientRect(): BBox {
    return this.getBBox();
  }

  public getCurrentDirtyRect(): BBox {
    const bboxList = lodash.flatten(
      this.children()
        .filter(item => item.attr.display)
        .map(child => child.getDirtyRects()),
    );
    return ceilBBox(unionBBox(bboxList));
  }

  protected computeBBox(): BBox {
    const bboxList = this.children()
      .filter(item => item.attr.display)
      .map(child => child.getBoundingClientRect());
    return unionBBox(bboxList);
  }

  public mounted() {
    super.mounted();
    this.eachChild(child => child.mounted());
  }

  public dirtyTransform() {
    super.dirtyTransform();
    this.eachChild(child => child.dirtyGlobalTransform());
  }

  public dirtyGlobalTransform() {
    super.dirtyGlobalTransform();
    this.eachChild(child => child.dirtyGlobalTransform());
  }

  public add(item: T, dirty: boolean = true): this {
    if (!item) {
      return;
    }

    if (item.parentNode === this) {
      this._moveToTail(item);
      dirty && item.dirty();
      return this;
    }
    if (!this.firstChild) {
      this.firstChild = this.lastChild = item;
    } else {
      item.prevSibling = this.lastChild;
      this.lastChild.nextSibling = item;
      this.lastChild = item;
    }
    item.nextSibling = null;
    this._length += 1;
    this._mountNode(item, dirty);
    return this;
  }

  public prepend(item: T) {
    if (!this.firstChild) {
      return this.add(item);
    }
    item.nextSibling = this.firstChild;
    this.firstChild.prevSibling = item;
    this.firstChild = item;
    this._length += 1;
    this._mountNode(item);
  }

  public addAll(items: T[]): this {
    items.forEach(item => this.add(item));
    return this;
  }

  public addChunk(items: T[] = []): this {
    if (items.length === 0) {
    }
    this._chunks.push(items);
    return this;
  }

  public replaceChunks(chunks: T[][]) {
    this._chunks = chunks;
  }

  public clearChunks() {
    this._chunks = [];
  }

  public getChunks(): T[][] {
    return this._chunks;
  }

  public getOneChunk(): {parent: Group, items: Element[]} {
    if (this._chunks.length > 0) {
      return {parent: this, items: this._chunks[0]}
    }
    let ret: any;
    this.eachChild(child => {
      if (child.isGroup) {
        ret = (child as any as Group).getOneChunk();
      }
      if (ret) {
        return false;
      }
    });
    return ret;
  }

  // 递归获取chunks
  public getAllChunks(out: ChunkItem[] = []): ChunkItem[] {
    if (this._chunks.length > 0) {
      out.push({
        parent: this,
        chunks: this._chunks,
      });
    }
    this.eachChild(child => {
      if (child.isGroup) {
        const childGroup = (child as any) as Group;
        childGroup.getAllChunks(out);
      }
    });
    return out;
  }

  public mountChunk(chunkItems: T[]) {
    this._chunks = this._chunks.filter(chunk => chunk !== chunkItems);
    chunkItems.forEach(item => this.add(item, false));
  }

  public remove(element: T) {
    if (element.parentNode !== this) {
      console.warn('remove component not child of this group');
      return;
    }
    if (element === this.firstChild) {
      this.firstChild = element.nextSibling;
    }
    if (element === this.lastChild) {
      this.lastChild = element.prevSibling;
    }
    if (element.nextSibling) {
      element.nextSibling.prevSibling = element.prevSibling;
    }
    if (element.prevSibling) {
      element.prevSibling.nextSibling = element.nextSibling;
    }
    element.prevSibling = null;
    element.nextSibling = null;
    this._length--;
    element.dirty();
    element.destroy();
    this.dirtyBBox();
  }

  public clear() {
    this.children().forEach(item => this.remove(item));
    this._length = 0;
    this._chunks = [];
    this.dirty();
    this.dirtyBBox();
  }

  public childAt(position: number): T {
    if (position < 0 || position >= this._length) {
      return null;
    }
    let current: Element = null;
    let index = 0;
    if (this._length / 2 > position) {
      current = this.firstChild;
      while (index++ < position) {
        current = current.nextSibling;
      }
    } else {
      current = this.lastChild;
      index = this._length - 1;
      while (index-- > position) {
        current = current.prevSibling;
      }
    }
    return current as T;
  }

  public onFrame(now: number) {
    super.onFrame(now);
    this.eachChild(child => child.onFrame(now));
  }

  public destroy() {
    super.destroy();
    this.clear();
    this._chunks = [];
  }

  public getLeafNodesSize(ret:{size: number, limit: number} = {size: 0, limit: 1000000000}): number {
    this.eachChild(child => {
      ret.size++;
      if (ret.size > ret.limit) {
        return false;
      }
      if (child.isGroup) {
        (child as any as Group).getLeafNodesSize(ret);
      }
    })
    return ret.size;
  }

  public updateAll(list: T[]) {
    this._chunks = [];
    const prevList = this.children();
    if (prevList.length === 0) {
      this.addAll(list);
      return;
    }

    const result = diff(prevList, list, (item, index) => {
      const attr = item.attr;
      const key = (attr.key !== undefined) ? item.type +  attr.key : `auto-key-${item.type}-${index}`;
      return key;
    });

    result.removed.forEach(index => {
      const node = prevList[index]
      const parentNode = node.parentNode;
      node.parentNode = this;
      this.remove(node);
      if (parentNode !== this) {
        node.parentNode = parentNode;
      }
    });

    result.ordered.forEach(([from, to], i) => {
      // todo
    });

    result.maintained.forEach(([from, to]) => {
      const prevElement = prevList[from];
      const nextElement = list[to];
      
      if (prevElement === nextElement) {
        return;
      }
     
      if (nextElement.attr.ref) {
        nextElement.attr.ref.current = prevElement;
      }
      if (prevElement.isGroup) {
        ((prevElement as unknown) as Group).updateAll(((nextElement as any) as Group).children());
        const chunks = ((nextElement as any) as Group).getChunks();
        ((prevElement as unknown) as Group).replaceChunks(chunks);
      }
      // todo clone matrix
      const dragOffset = nextElement.getDragOffset();
      prevElement.setDragOffset(dragOffset[0], dragOffset[1]);
     this._diffUpdateElement(prevElement, nextElement);
    });
    result.added.forEach(index => {
      this.add(list[index]);
    });
  }

  public eachChild(callback: (child: T) => any) {
    let node = this.firstChild as T;
    while (node) {
      const ret = callback(node);
      if (ret === false) {
        break;
      }
      node = node.nextSibling as T;
    }
    node = null;
  }

  public children(): T[] {
    const ret: T[] = [];
    let node = this.firstChild as T;
    while (node) {
      ret.push(node);
      node = node.nextSibling as T;
    }
    node = null;
    return ret;
  }

  public getAllLeafNodes(ret: Shape[] = [], ignoreInvisible = false, ignoreMute = false): Shape[] {
    this.eachChild(item => {
      if (item.attr.display === false && ignoreInvisible) {
        return;
      }
      if (!item.isGroup && !(item.getExtendAttr('pointerEvents') === 'none' && ignoreMute)) {
        ret.push((item as any) as Shape);
      } else if (item.isGroup) {
        ((item as any) as Group).getAllLeafNodes(ret, ignoreInvisible, ignoreMute);
      }
    });
    return ret;
  }

  public resetPickRGB() {
    super.resetPickRGB();
    this.eachChild(child => child.resetPickRGB());
  }

  public dirtyClipTarget(clip: Element) {
    super.dirtyClipTarget(clip);
    this.eachChild(child => child.dirtyClipTarget(clip));
  }

  public dirtyTextChildBBox() {
    this.eachChild(child => {
      if (child.type === 'text') {
        child.dirtyBBox();
      }
      if (child.isGroup) {
        (child as any as Group).dirtyTextChildBBox()
      }
    })
  }

  private _mountNode(item: T, dirty: boolean = true) {
    item.parentNode = this;
    item.mounted();
    if (dirty) {
      this.dirty(item);
    }
    this.dirtyBBox();
  }

  private _moveToTail(item: T) {
    if (this.lastChild === item) {
      return;
    }

    if (this.firstChild === item) {
      this.firstChild = item.nextSibling;
      this.firstChild.prevSibling = null;
      const last = this.lastChild;
      item.prevSibling = this.lastChild;
      this.lastChild = last.nextSibling = item;
      item.nextSibling = null;
    } else {
      // 中间节点
      item.prevSibling.nextSibling = item.nextSibling;
      item.nextSibling.prevSibling = item.prevSibling;
      item.prevSibling = this.lastChild;
      this.lastChild.nextSibling = item;
      item.nextSibling = null;
      this.lastChild = item;
    }

    if (this.ownerRender?.renderer === 'svg') {
      const dom = this._findSVGDomNode(item);
      if (dom && dom.parentNode) {
        dom.parentNode.appendChild(dom);
      } else {
        console.warn('dom not exist', item);
      }
    }
  }

  private _diffUpdateElement(prevElement: Element, nextElement: Element) {
    const prevAttr = prevElement.attr;
    const nextAttr = nextElement.attr;
    const {transitionDuration = defaultSetting.during, transitionEase = defaultSetting.ease, transitionProperty = 'all', transitionDelay = 0 } = nextElement.attr;
    
    for (let key in prevAttr) {
      if (!(key in nextAttr)) {
        prevElement.removeAttr(key as any)
      }
    }
    
    if (transitionProperty === 'none' || transitionProperty.length === 0) {
      for (let key in nextAttr) {
        if (nextAttr[key as any as keyof typeof nextAttr] !== prevAttr[key as any as keyof typeof prevAttr]) {
          prevElement.setAttr(key as any, nextAttr[key as any as keyof typeof nextAttr])
        }
      }
    } else {
      const nextAttr = transitionProperty === 'all' ? nextElement.attr : lodash.pick(nextElement.attr, transitionProperty as any);
      prevElement.stopAllAnimation().animateTo(nextAttr, transitionDuration, transitionEase, null, transitionDelay);
    }
  }

  private _findSVGDomNode(item: Element) {
    return (this.ownerRender.getPainter() as SVGPainter).findDOMNode(item);
  }
}
