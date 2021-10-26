import { diff } from '@egjs/list-differ';
import Element, { defaultSetting } from './Element';
import { TypeCustomElement } from './CustomElement';
import Shape from './Shape';
import { TextConf, shapeKeys } from './Text';
import { BBox, unionBBox, ceilBBox } from '../utils/bbox';
import * as lodash from '../utils/lodash';
import SVGPainter from '../painter/SVGPainter';

export interface GroupConf extends TextConf {}

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
    };
  }

  protected onAttrChange(key: any, value: any, oldValue: any) {
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
    if (this._chunks.length) {
      this.onChunkChange();
    }
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
    super.destroy();
    this.clear();
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

  public updateAll(list: T[]) {
    if (this._chunks.length) {
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
      nextList.splice(index, 0, list[index]);
    });

    this.firstChild = nextList[0];
    this.lastChild = nextList[nextList.length - 1];
    for (let i = 0; i < nextList.length; i++) {
      nextList[i].prevSibling = nextList[i - 1];
      nextList[i].nextSibling = nextList[i + 1];
    }
  }

  public eachChild(callback: (child: T) => void) {
    let node = this.firstChild as T;
    while (node) {
      callback(node);
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

  private _diffUpdateElement(prevElement: Element, nextElement: Element) {
    const prevAttr = prevElement.attr;
    const nextAttr = nextElement.attr;
    const {
      transitionDuration = defaultSetting.during,
      transitionEase = defaultSetting.ease,
      transitionProperty = 'all',
      transitionDelay = 0,
    } = nextElement.attr;
    prevElement.startAttrTransaction();
    for (const key in prevAttr) {
      if (!(key in nextAttr)) {
        prevElement.removeAttr(key as any);
      }
    }

    if (transitionProperty === 'none' || transitionProperty.length === 0) {
      prevElement.setAttr(nextAttr);
    } else {
      // todo transition property array support
      const transitionAttr =
        transitionProperty === 'all'
          ? nextAttr
          : lodash.pick(nextAttr, transitionProperty as any);
      prevElement
        .stopAllAnimation()
        .animateTo(transitionAttr, transitionDuration, transitionEase, null, transitionDelay);
    }
    if ((prevElement as TypeCustomElement).$$CustomType) {
      (prevElement as TypeCustomElement).skipUpdate();
    }
    prevElement.endAttrTransaction();
  }

  private _findSVGDomNode(item: Element) {
    return (this.ownerRender.getPainter() as SVGPainter).findDOMNode(item);
  }
}
