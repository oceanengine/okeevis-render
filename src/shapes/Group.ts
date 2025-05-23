import { diff } from '@egjs/list-differ';
import Element, { defaultSetting } from './Element';
import { TypeCustomElement } from './CustomElement';
import { forEach } from '../react/Children';
import Shape from './Shape';
import { TextAttr, shapeKeys } from './Text';
import { BBox, unionBBox, ceilBBox } from '../utils/bbox';
import * as lodash from '../utils/lodash';
import type SVGPainter from '../painter/SVGPainter';
import type { HookElement } from '../react/hooks';


export interface GroupAttr extends TextAttr {}

export interface ChunkItem {
  parent: Group;
  chunks: Element[][];
}

export default class Group<T extends Element = Element> extends Element<GroupAttr> {
  public type = 'group';

  public svgTagName = 'g';

  public fillAble = false;

  public strokeAble = false;

  public shapeKeys = shapeKeys;

  public _zIndexDirty: boolean = false;

  private _length: number = 0;

  protected _chunks: T[][] = [];

  private _childrenChanged = false;

  public get size(): number {
    return this._length; 
  }

  public static isGroup(obj: unknown): obj is Group {
    return (obj as Group).isGroup;
  }

  public getDefaultAttr(): GroupAttr {
    return {
      ...super.getDefaultAttr(),
    };
  }

  public get isGroup() {
    return true;
  }

  protected onAttrChange(key: any, value: any, oldValue: any) {
    super.onAttrChange(key, value, oldValue);
    if (key === 'children') {
      this._childrenChanged = true;
    }
    if (shapeKeys.indexOf(key) !== -1) {
      this.dirtyTextChildBBox();
    }
  }

  protected afterAttrChanged() {
    super.afterAttrChanged();
    if (this._childrenChanged) {
      this._childrenChanged = false;
      this.mountChildren();
    }
  }

  protected getChildrenContainer(): Group {
    return this;
  }

  protected mountChildren() {
    const children = this.attr.children;
    if (this.ownerRender && children) {
      const nodes: Element[] = [];
      const mapChildren = forEach(children, (child: any) => {
        if (child && Element.isElementConstructor(child)) {
          nodes.push(child);
        }
      });
      this.getChildrenContainer().updateAll(nodes);
    }
  }

  public getAnimationKeys(): Array<keyof GroupAttr> {
    return [...super.getAnimationKeys(), 'fontSize'];
  }

  public computeBoundingClientRect(): BBox {
    const bboxList = this.children()
    .filter(item => item.attr.display)
    .map(child => child.getBoundingClientRect());

    return unionBBox(bboxList);
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
    .map(child => child.computeBBoxWithLocalTransform());

    return unionBBox(bboxList);
  }
  
  public computeBBoxWithLocalTransform(): BBox {
    const bboxList = this.children()
   .filter(item => item.attr.display)
   .map(child => child.computeBBoxWithLocalTransform());
    const bbox = unionBBox(bboxList);
    const matrix = this.getTransform(true);
    if (!matrix) {
      return bbox;
    }
    return this.computeBBoxWithTransform(bbox, 0, 0, bbox.width, bbox.height, matrix);
  }

  public mounted() {
    super.mounted();
    if (this._chunks.length) {
      this.onChunkChange();
    }
    this.eachChild(child => child.mounted());
    this.mountChildren();
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

  public replaceChild(child: T, target: T): void {
    if (child.parentNode !== this) {
      return;
    }
    child.dirty();
    const prev = child.prevSibling;
    const next = child.nextSibling;
    target.prevSibling = prev;
    target.nextSibling = next;
    if (prev) {
      prev.nextSibling = target;
    }
    if (next) {
      next.prevSibling = target;
    }
    if (this.firstChild === child) {
      this.firstChild = target;
    }
    if (this.lastChild === child) {
      this.lastChild = target;
    }

    child.destroy();
    this._mountNode(target);
  }

  // https://developer.mozilla.org/zh-CN/docs/Web/API/Node/insertBefore
  // public insertBefore(newNode: T, refNode: T | null) {
  //   if (!refNode) {
  //     return this.add(newNode);
  //   }
  //   if (refNode.prevSibling === newNode || refNode.parentNode !== this || newNode === refNode) {
  //     return;
  //   }
  //   if (newNode.parentNode) {
  //     newNode.parentNode.remove(newNode);
  //     if (this.ownerRender?.renderer === 'svg') {
  //       const newDom = this._findSVGDomNode(newNode);
  //       const prevDom = this._findSVGDomNode(refNode);
  //       if (newDom && prevDom && prevDom.parentNode) {
  //         prevDom.parentNode.insertBefore(newDom, prevDom);
  //       }
  //     }
  //   }
  //   newNode.nextSibling = refNode;
  //   if (refNode.prevSibling) {
  //     refNode.prevSibling.nextSibling = newNode;
  //     newNode.prevSibling = refNode.prevSibling;
  //   } else {
  //     this.firstChild = newNode;
  //   }
  //   refNode.prevSibling = newNode;
  //   this._length += 1;
  //   this._mountNode(newNode);
  // }

  public addAll(items: T[]): this {
    items.forEach(item => this.add(item));
    return this;
  }

  public addChunk(items: T[] = []): this {
    if (items.length === 0) {
      return this;
    }
    this._chunks.push(items);
    this.onChunkChange();
    return this;
  }

  public replaceChunks(chunks: T[][]) {
    this._chunks = chunks;
    this.onChunkChange();
  }

  public clearChunks() {
    this._chunks = [];
    this.onChunkChange();
  }

  public getChunks(): T[][] {
    return this._chunks;
  }

  protected onChunkChange() {
    if (this.ownerRender) {
      if (this._chunks.length) {
        this.ownerRender.chunksElement.add(this);
        this.ownerRender.nextTick();
      } else {
        this.ownerRender.chunksElement.delete(this);
      }
    }
  }

  public mountChunk(chunkItems: T[]) {
    this._chunks = this._chunks.filter(chunk => chunk !== chunkItems);
    chunkItems.forEach(item => this.add(item, false));
    if (this._chunks.length === 0) {
      this.ownerRender.chunksElement.delete(this);
    }
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
    this._zIndexDirty = false;
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

  public destroy() {
    if (this._chunks.length) {
      this.clearChunks();
    }
    this.clear();
    super.destroy();
    this._chunks = [];
  }

  public getLeafNodesSize(max: number = Number.MAX_SAFE_INTEGER): number {
    if (this.size >= max) {
      return max;
    }
    const nodes = this.childNodes;
    let count = 0;
    while (nodes.length) {
      const node = nodes.pop() as Group;
      count++;
      if (count >= max) {
        break;
      }
      if (node.isGroup) {
        if (node.size > max) {
          return max;
        }
        (node as Group).eachChild(child => {
          if (nodes.length < max) {
            nodes.push(child);
          }
        });
      }
    }
    return count;
  }

  public updateAll(list: T[], transition: boolean = true) {
    if (this._chunks?.length) {
      this.replaceChunks([]);
    }
    const prevList = this.children();
    if (prevList.length === 0) {
      this.addAll(list);
      return;
    }
    const nextList = prevList.slice();

    const result = diff(prevList, list, (item, index) => {
      const attr = item.attr;
      const key = attr.key !== undefined ? item.type + attr.key : `auto-key-${item.type}-${index}`;
      return key;
    });

    result.removed.forEach(index => {
      nextList.splice(index, 1);
      const node = prevList[index];
      const parentNode = node.parentNode;
      node.parentNode = this;
      this.remove(node);
      if (parentNode !== this) {
        node.parentNode = parentNode;
      }
    });

    result.ordered.forEach(([from, to], i) => {
      nextList.splice(from, 1);
      nextList.splice(to, 0, prevList[result.pureChanged[i][0]]);
    });

    result.maintained.forEach(([from, to]) => {
      const prevElement = prevList[from];
      const nextElement = list[to];

      if (prevElement === nextElement) {
        prevElement.ownerRender = nextElement.ownerRender = this.ownerRender;
        return;
      }

      if (nextElement.attr.ref) {
        nextElement.attr.ref.current = prevElement;
      }
      if (prevElement.isGroup) {
        if (Element.isHookElement(prevElement) && Element.isHookElement(nextElement)) {
          if (prevElement.$$type === nextElement.$$type) {
            prevElement.updateProps((nextElement as unknown as HookElement).props);
          } else {
            prevElement.replaceWith(nextElement);
          }
        } else {
          if (!prevElement.attr.children) {
            ((prevElement as unknown) as Group).updateAll(((nextElement as any) as Group).children(), transition);
          }
          const chunks = ((nextElement as any) as Group).getChunks();
          ((prevElement as unknown) as Group).replaceChunks(chunks);
        }
      }
      // todo clone matrix
      const dragOffset = nextElement.getDragOffset();
      prevElement.setDragOffset(dragOffset[0], dragOffset[1]);
      
      if (!Element.isHookElement(prevElement)) {
        this._diffUpdateElement(prevElement, nextElement, transition);
      }
    });

    result.added.forEach(index => {
      this.add(list[index]);
      nextList.splice(index, 0, list[index]);
    });

    this.firstChild = nextList[0];
    this.lastChild = nextList[nextList.length - 1];
    for (let i = 0; i < nextList.length; i++) {
      nextList[i].prevSibling = nextList[i - 1];
      nextList[i].nextSibling = nextList[i + 1];
    }
    this.afterUpdateAll();
  }

  public divideChild(element: T, count: number) {
    if (element.parentNode !== this) {
      console.warn('divide error, not child node');
      return;
    }
    this.remove(element);
    element.divide(count).forEach(el => {
      this.add(el as T);
    })
  }

  public eachChild(callback: (child: T) => void) {
    let node = this.firstChild as T;
    while (node) {
      callback(node);
      node = node.nextSibling as T;
    }
    node = null;
  }

  public eachChildSorted(callback: (child: T) => void) {
    if (!this._zIndexDirty) {
      this.eachChild(child => callback(child));
      return;
    }
    const children = this.children();
    children.sort((a, b) => {
      const aZIndex = a.attr.zIndex || 0;
      const bZIndex = b.attr.zIndex || 0;
      return aZIndex - bZIndex;
    });
    children.forEach(child => callback(child));
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

  public traverse(callback: (node: Element) => void) {
    this.eachChild(child => {
      callback(child);
      if (child.isGroup) {
        (child as any as Group).traverse(callback);
      }
    });
  }

  public getAllLeafNodes(ret: Shape[], filter: Function): Shape[] {
    this.eachChild(item => {
      if (item.attr.display === false) {
        return;
      }
      if (!item.isGroup) {
        if (filter(item)) {
          ret.push((item as any) as Shape);
        }
      } else {
        ((item as any) as Group).getAllLeafNodes(ret, filter);
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
        ((child as any) as Group).dirtyTextChildBBox();
      }
    });
  }

  public onChildDirty(): void {
    this._refElements?.forEach(ref => {
      ref.dirty();
      ref.dirtyTransform();
      ref.dirtyBBox();
    });
  }

  protected afterUpdateAll() {
    // nothing
  }

  private _mountNode(item: T, dirty: boolean = true) {
    item.parentNode = this;
    item.mounted();
    if (dirty) {
      item.dirty();
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
      item.prevSibling.nextSibling = item.nextSibling;
      if (item.nextSibling) {
        item.nextSibling.prevSibling = item.prevSibling;
      }
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

  private _diffUpdateElement(prevElement: Element, nextElement: Element, transition: boolean) {
    const nextAttr = nextElement.getUserAttr();
    prevElement.replaceAttr(nextAttr, transition);
  }

  private _findSVGDomNode(item: Element) {
    return (this.ownerRender.getPainter() as SVGPainter).findDOMNode(item);
  }
}
