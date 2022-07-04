import Group, { GroupAttr } from './Group';
import Element, { ElementAttr } from './Element';
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
  showScrollBar?: boolean;
  onScroll?: Function;
  maxScrollLeft?: number;
  maxScrollTop?: number;
}

const scrollTrackSize = 11;
const scorllBarSize = 6;
const trackBorderColor = '#ebebeb';
const barColor = '#e0e0e0';
const barActiveColor = '#c1c1c1';

export default class ScrollView extends Group {
  public type = 'scrollView';

  public attr: ScrollViewAttr;

  private _scrollContentGroup: Group;

  private _bgRect: Rect;

  private _clipGroup: Group;

  private _horizontalScrollBar: Rect;

  private _verticalScrollBar: Rect;

  private _horizontalScrollTrack: Rect;

  private _verticalScrollTrack: Rect;

  private _scrollLeft: number = 0;

  private _scrollTop: number = 0;

  private _isMouseEnter: boolean = false;

  // eslint-disable-next-line no-useless-constructor
  public constructor(attr: ScrollViewAttr) {
    super(attr);
  }

  protected update(): void {
    const { x, y, width, height, } = this.attr;
    (this._clipGroup?.attr.clip as Rect)?.setAttr({ x, y, width, height });
    this._bgRect?.setAttr({ x, y, width, height });
    if (lodash.isNumber(this._scrollLeft && lodash.isNumber(this._scrollTop))) {
      this.scrollTo(this._scrollLeft, this._scrollTop)
    }
  }

  protected afterUpdateAll() {
    this._updateHorizontalBar();
    this._updateVerticalBar();
    setTimeout(() => {
      this._updateHorizontalBar();
      this._updateVerticalBar();
    });
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
      showScrollBar: false,
    }
  }

  public get clientWidth() {
    const { showScrollBar, scrollY, height, scrollHeight, width } = this.attr;
    return showScrollBar && (scrollY && height < scrollHeight) ? width - scrollTrackSize : width;
  }

  public get clientHeight() {
    const { showScrollBar, scrollX, height, scrollWidth, width } = this.attr;
    return showScrollBar && (scrollX && width < scrollWidth) ? height - scrollTrackSize : height;
  }

  public get scrollLeft(): number {
    return this._scrollLeft || 0;
  }

  public set scrollLeft(x: number) {
    const { scrollWidth, maxScrollLeft } = this.attr;
    const width = this.clientWidth;
    const scrollLeft = lodash.clamp(x, 0, maxScrollLeft || (scrollWidth - width));
    this._scrollLeft = scrollLeft;
    this._scrollContentGroup?.setAttr('translateX', -scrollLeft);
    this._updateHorizontalBar();
  }

  public get scrollTop(): number {
    return this._scrollTop || 0;
  }

  public set scrollTop(y: number) {
    const { scrollHeight, maxScrollTop } = this.attr;
    const height = this.clientHeight;
    const scrollTop = lodash.clamp(y, 0, maxScrollTop || (scrollHeight - height));
    this._scrollTop = scrollTop;
    this._scrollContentGroup?.setAttr('translateY', -scrollTop);
    this._updateVerticalBar();
  }

  public scrollBy(dx: number, dy: number) {
    this.scrollTo(this._scrollLeft + dx, this._scrollTop + dy);
  }

  public scrollTo(x: number, y: number) {
    this.scrollLeft = x;
    this.scrollTop = y;
  }

  protected created() {
    const { x, y, width, height } = this.attr;
    const clipRect = new Rect({ x, y, width, height });
    const clipGroup = this._clipGroup = new Group({
      key: 'clip-group',
      clip: clipRect,
      draggable: true,
      getDragOffset: () => {
        return { x: 0, y: 0 }
      },
      onDrag: e => this._eventScrollBy(e.currentTarget.parentNode as ScrollView, -e.dx, -e.dy),
    });
    this._bgRect = new Rect({
      key: 'event-rect',
      x,
      y,
      width,
      height,
      fill: 'rgba(0,0,0,0)',
    });
    clipGroup.add(this._bgRect);
    this.add(clipGroup);
    this.setAttr({
      onMouseLeave: event => {
        const self = event.currentTarget as this;
        self._isMouseEnter = false;
        self._updateHorizontalBar();
        self._updateVerticalBar();
      },
      onMouseEnter: event => {
        const self = event.currentTarget as this;
        self._isMouseEnter = true;
        self._updateHorizontalBar();
        self._updateVerticalBar();
      },
      onWheel: event => {
        event.preventDefault();
        this._eventScrollBy(event.currentTarget as ScrollView, event.normalizeWheel.pixelX, event.normalizeWheel.pixelY)
      },
    })
    const contentGroup = new Group({
      key: 'scroll-content',
      translateX: this._scrollLeft,
      translateY: this._scrollTop,
      transitionProperty: 'none',
    });
    clipGroup.add(contentGroup);
    this._scrollContentGroup = contentGroup;
    this._attachScrollBar();

  }

  private _eventScrollBy(target: ScrollView, dx: number, dy: number) {
    const { scrollX, scrollY, onScroll } = target.attr;
    target.scrollBy(scrollX ? dx : 0, scrollY ? dy : 0);
    onScroll && onScroll();
  }

  private _attachScrollBar() {
    const commonBarAttr: ElementAttr = {
      draggable: true,
      stroke: 'rgba(0,0,0,0)',
      lineWidth: 8,
      r: 5,
      fill: barColor,
      transitionProperty: 'none',
      onMouseEnter: e => e.target.setAttr({ fill: barActiveColor }),
      onMouseLeave: e => e.target.setAttr({ fill: barColor }),
      getDragOffset: () => {
        return { x: 0, y: 0 }
      },
    };
    this._horizontalScrollBar = new Rect({
      key: 'scrollbar-x',
      ...commonBarAttr,
      onDrag: e => {
        const item = e.target.parentNode as ScrollView;
        const scaleX = item.clientWidth / item.attr.scrollWidth;
        (item as this)._eventScrollBy(item, e.dx / scaleX, 0);
      }
    });
    this._verticalScrollBar = new Rect({
      key: 'scrollbar-y',
      ...commonBarAttr,
      onDrag: e => {
        const item = e.target.parentNode as ScrollView;
        const scaleY = item.clientHeight / item.attr.scrollHeight;
        (item as this)._eventScrollBy(item, 0, e.dy / scaleY);
      }
    });;
    this._horizontalScrollTrack = new Rect({
      key: 'scroll-track-x',
      onClick: e => (e.target.parentNode as ScrollView)._handleTrackClick('x', e.x),
    });
    this._verticalScrollTrack = new Rect({
      key: 'scroll-track--y',
      onClick: e => (e.target.parentNode as ScrollView)._handleTrackClick('y', e.y),
    });
    this._updateHorizontalBar();
    this._updateVerticalBar();
    if (this.attr.scrollX) {
      this.add(this._horizontalScrollTrack)
      this.add(this._horizontalScrollBar);
    }
    if (this.attr.scrollY) {
      this.add(this._verticalScrollTrack);
      this.add(this._verticalScrollBar);
    }
  }

  private _updateHorizontalBar() {
    const { x, y, width, height, scrollWidth } = this.attr;
    const clientWidth = this.clientWidth;
    const scaleX = clientWidth / scrollWidth;
    const dx = this.scrollLeft * scaleX;
    const yposition = y + height - scrollTrackSize / 2 - 0.5;
    const show = scaleX < 1 && this.attr.showScrollBar && this._isMouseEnter;
    this._horizontalScrollTrack.setAttr({
      display: show,
      x,
      y: yposition - scrollTrackSize / 2,
      width,
      height: scrollTrackSize,
      fill: '#fafafa',
      stroke: trackBorderColor,
      lineWidth: 1,
    });
    this._horizontalScrollBar.setAttr({
      display: show,
      x: x + dx,
      y: yposition - scorllBarSize / 2,
      width: clientWidth * scaleX,
      height: scorllBarSize,
    });
  }

  private _updateVerticalBar() {
    const { x, y, width, height, scrollHeight } = this.attr;
    const clientHeight = this.clientHeight;
    const scaleY = clientHeight / scrollHeight;
    const dy = this.scrollTop * scaleY;
    const xposition = x + width - scrollTrackSize / 2 - 0.5;
    const show = scaleY < 1 && this.attr.showScrollBar && this._isMouseEnter;
    this._verticalScrollTrack.setAttr({
      display: show,
      x: xposition - scrollTrackSize / 2,
      y,
      width: scrollTrackSize,
      height,
      fill: '#fafafa',
      stroke: trackBorderColor,
      lineWidth: 1,
    });
    this._verticalScrollBar.setAttr({
      display: show,
      x: xposition - scorllBarSize / 2,
      y: y + dy,
      width: scorllBarSize,
      height: clientHeight * scaleY,
    });
  }

  private _handleTrackClick(axis: 'x' | 'y', position: number) {
    const { x, y, scrollWidth, scrollHeight } = this.attr;
    const clientWidth = this.clientWidth;
    const clientHeight = this.clientHeight;
    const scaleX = clientWidth / scrollWidth;
    const scaleY = clientHeight / scrollHeight;
    const dx = this.scrollLeft * scaleX;
    const dy = this.scrollTop * scaleY;
    const minX = x + dx;
    const maxX = minX + clientWidth * scaleX;
    const minY = y + dy;
    const maxY = minY + clientHeight * scaleY;
    if (axis === 'x' && (position < minX || position > maxX)) {
      const flag = position < minX ? -1 : 1;
      this._eventScrollBy(this, flag * clientWidth, 0);
    }
    if (axis === 'y' && (position < minY || position > maxY)) {
      const flag = position < minY ? -1 : 1;
      this._eventScrollBy(this, 0, flag * clientHeight);
    }
  }
}