import Group, { GroupAttr } from './Group';
import Element from './Element';
import Rect from './Rect';
import * as lodash from '../utils/lodash';

interface ScrollViewAttr extends GroupAttr {
  x: number;
  y: number;
  width: number;
  height: number;
  scrollWidth?: number;
  scrollHeight?: number;
  scrollX?: boolean;
  scrollY?: boolean;
  scrollLeft?: number;
  scrollTop?: number;
  onScroll?: Function;
}

export default class ScrollView extends Group {
  public type = 'scrollView';

  public attr: ScrollViewAttr;

  private _scrollContentGroup: Group;

  private _bgRect: Rect;

  private _scrollLeft: number;

  private _scrollTop: number;

  // eslint-disable-next-line no-useless-constructor
  public constructor(attr: ScrollViewAttr) {
    super(attr);
    this._scrollLeft = this.attr.scrollLeft;
    this._scrollTop = this.attr.scrollTop;
  }

  protected update(): void {
    const { x, y, width, height, } = this.attr;
    (this.attr.clip as Rect)?.setAttr({ x, y, width, height });
    this._bgRect?.setAttr({ x, y, width, height });
    this.scrollTo(this._scrollLeft, this._scrollTop)
  }

  public addContent(element: Element) {
    this._scrollContentGroup.add(element);
  }

  public getDefaultAttr(): ScrollViewAttr {
    return {
      display: true,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      scrollWidth: 0,
      scrollHeight: 0,
      scrollX: false,
      scrollY: false,
      scrollLeft: 0,
      scrollTop: 0,
    }
  }

  public get scrollLeft(): number {
    return this._scrollLeft;
  }

  public set scrollLeft(x: number) {
    const { width, scrollWidth } = this.attr;
    const scrollLeft = lodash.clamp(x, 0, scrollWidth - width);
    this._scrollLeft = scrollLeft;
    this._scrollContentGroup?.setAttr('translateX', -scrollLeft);
  }

  public get scrollTop(): number {
    return this._scrollTop;
  }

  public set scrollTop(y: number) {
    const { height, scrollHeight } = this.attr;
    const scrollTop = lodash.clamp(y, 0, scrollHeight - height);
    this._scrollTop = scrollTop;
    this._scrollContentGroup?.setAttr('translateY', -scrollTop);
  }

  public scrollBy(dx: number, dy: number) {
    this.scrollTo(this._scrollLeft + dx, this._scrollTop + dy);
  }

  public scrollTo(x: number, y: number) {
    this.scrollLeft = x;
    this.scrollTop = y;
  }

  protected created() {
    const { x, y, width, height, scrollLeft, scrollTop } = this.attr;
    const clipRect = new Rect({ x, y, width, height });
    this._bgRect = new Rect({
      key: 'event-rect',
      x,
      y,
      width,
      height,
      fill: 'rgba(0,0,0,0)',
    });
    this.setAttr('clip', clipRect);
    this.add(this._bgRect);
    this.setAttr({
      draggable: true,
      getDragOffset: () => {
        return { x: 0, y: 0 }
      },
      onDrag: e => this._eventScrollBy(e.currentTarget as ScrollView, -e.dx, -e.dy),
      onWheel: event => {
        event.preventDefault();
        this._eventScrollBy(event.currentTarget as ScrollView, event.normalizeWheel.pixelX, event.normalizeWheel.pixelY)
      },
    })
    const group = new Group({
      key: 'scroll-content',
      translateX: scrollLeft,
      translateY: scrollTop,
      transitionProperty: 'none',
    });
    this._scrollContentGroup = group;
    this.add(group);
  }

  private _eventScrollBy(target: ScrollView, dx: number, dy: number) {
    const { scrollX, scrollY, onScroll } = target.attr;
    target.scrollBy(scrollX ? dx : 0, scrollY ? dy : 0);
    onScroll && onScroll();
  }
}