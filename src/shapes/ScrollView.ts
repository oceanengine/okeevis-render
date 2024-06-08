import Group, { GroupAttr } from './Group';
import Element from './Element';
import Rect, { RectAttr } from './Rect';
import * as lodash from '../utils/lodash';
import type DOMNode from './DOMNode';
import { isMobile } from '../utils/env';
import { SyntheticEvent } from '../event';

export interface ScrollViewAttr extends GroupAttr {
  x: number;
  y: number;
  width: number;
  height: number;
  scrollWidth?: number;
  scrollHeight?: number;
  scrollX?: boolean;
  scrollY?: boolean;
  onScroll?: (event: SyntheticEvent) => void;
  maxScrollLeft?: number;
  maxScrollTop?: number;
  showScrollBar?: boolean | 'hover' | 'scrolling';
  scrollBarSize?: number;
  scrollThumbColor?: string;
  scrollThumbHoverColor?: string;
  scrollTrackColor?: string;
  scrollTrackBorderColor?: string;
}

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

  private _isScrolling: boolean = false;

  private _inTransction: boolean = false;

  // eslint-disable-next-line no-useless-constructor
  public constructor(attr: ScrollViewAttr) {
    super(attr);
    this._debouncedFadeScrollBar = lodash.debounce(this._debouncedFadeScrollBar, 500).bind(this);
    this._debounceStopScroll = lodash.debounce(this._debounceStopScroll, 80).bind(this);
  }

  protected afterAttrChanged(): void {
    super.afterAttrChanged();
    const { x, y, width, height } = this.attr;
    (this._clipGroup?.attr.clip as Rect)?.setAttr({ x, y, width, height });
    this._bgRect?.setAttr({ x, y, width, height });
    if (lodash.isNumber(this._scrollLeft) && lodash.isNumber(this._scrollTop)) {
      this.scrollTo(this._scrollLeft, this._scrollTop);
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

  /**
   * 
   * @param children children
   */
  protected updateChildren(children: Element | Element[]) {
    this._scrollContentGroup?.updateAll(Array.isArray(children) ? children : [children]);
  }

  public getContentGroup(): Group {
    return this._scrollContentGroup;
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
      scrollBarSize: 11,
      scrollThumbColor: '#e0e0e0',
      scrollThumbHoverColor: '#c1c1c1',
      scrollTrackColor: '#fafafa',
      scrollTrackBorderColor: '#ebebeb',
    };
  }

  public get clientWidth() {
    const { showScrollBar, scrollY, height, scrollHeight, width, scrollBarSize } = this.attr;
    return showScrollBar && scrollY && height < scrollHeight ? width - scrollBarSize : width;
  }

  public get clientHeight() {
    const { showScrollBar, scrollX, height, scrollWidth, width, scrollBarSize } = this.attr;
    return showScrollBar && scrollX && width < scrollWidth ? height - scrollBarSize : height;
  }

  public get scrollLeft(): number {
    return this._scrollLeft || 0;
  }

  public set scrollLeft(x: number) {
    const { scrollWidth, maxScrollLeft } = this.attr;
    const width = this.clientWidth;
    const scrollLeft = lodash.clamp(x, 0, maxScrollLeft || scrollWidth - width);
    if (scrollLeft === this._scrollLeft) {
      return;
    }
    this._scrollLeft = scrollLeft;
    this._scrollContentGroup?.setAttr('translateX', -scrollLeft);
    this._updateHorizontalBar();
    this._updateDomNodeClipAndSticky();
    this._dispatchScrollEvent();
  }

  public get scrollTop(): number {
    return this._scrollTop || 0;
  }

  public set scrollTop(y: number) {
    const { scrollHeight, maxScrollTop } = this.attr;
    const height = this.clientHeight;
    const scrollTop = lodash.clamp(y, 0, maxScrollTop || scrollHeight - height);
    if (scrollTop === this._scrollTop) {
      return;
    }
    this._scrollTop = scrollTop;
    this._scrollContentGroup?.setAttr('translateY', -scrollTop);
    this._updateVerticalBar();
    this._updateDomNodeClipAndSticky();
    this._dispatchScrollEvent();
  }

  public scrollBy(dx: number, dy: number) {
    this.scrollTo(this._scrollLeft + dx, this._scrollTop + dy);
  }

  public scrollTo(x: number, y: number) {
    const {scrollLeft, scrollTop} = this;
    this._inTransction = true;
    this.scrollLeft = x;
    this.scrollTop = y;
    this._inTransction = false;
    if (scrollLeft !== this.scrollLeft || scrollTop !== this.scrollTop) {
      this._dispatchScrollEvent();
    }
  }

  public mounted() {
    super.mounted();
    this._updateDomNodeClipAndSticky();
  }

  protected created() {
    const { x, y, width, height, children } = this.attr;
    const clipRect = new Rect({ x, y, width, height });
    const clipGroup = (this._clipGroup = new Group({
      key: 'clip-group',
      clip: clipRect,
      draggable: isMobile,
      getDragOffset: () => {
        return { x: 0, y: 0 };
      },
      onDrag: e => this._eventScrollBy(e.currentTarget.parentNode as ScrollView, -e.dx, -e.dy),
    }));
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
        const _this = event.currentTarget as ScrollView;
        const { scrollTop, scrollLeft, clientWidth, clientHeight, attr } =_this;
        const isToBottom = scrollTop +  clientHeight - attr.scrollHeight === 0;
        const isToRight =  scrollLeft + clientWidth -  attr.scrollWidth === 0;
        const { pixelX, pixelY} = event.normalizeWheel;
        const nopreventX = pixelX === 0 || !_this.attr.scrollX || (_this.scrollLeft === 0 && pixelX < 0) || (isToRight && pixelX > 0);
        const nopreventY =  pixelY === 0 || !_this.attr.scrollY || (_this.scrollTop === 0 && pixelY < 0 || (isToBottom && pixelY > 0));
        if (!(nopreventX && nopreventY)) {
          this._isScrolling = true;
        }

        if (this._isScrolling) {
          event.preventDefault();
          this._debounceStopScroll();
        }

        this._eventScrollBy(
          event.currentTarget as ScrollView,
          pixelX,
          pixelY,
        );
      },
    });
    const contentGroup = new Group({
      key: 'scroll-content',
      translateX: this._scrollLeft,
      translateY: this._scrollTop,
      transitionProperty: 'none',
    });
    clipGroup.add(contentGroup);
    this._scrollContentGroup = contentGroup;
    this._attachScrollBar();
    if (children) {
      this.updateChildren(children);
    }
  }

  private _eventScrollBy(target: ScrollView, dx: number, dy: number) {
    const { scrollX, scrollY, showScrollBar } = target.attr;
    if (showScrollBar === 'scrolling') {
      const elements = [
        this._horizontalScrollBar,
        this._horizontalScrollTrack,
        this._verticalScrollBar,
        this._verticalScrollTrack,
      ];
      elements.forEach(item => item.stopAllAnimation());
      target._debouncedFadeScrollBar();
    }
    target.scrollBy(scrollX ? dx : 0, scrollY ? dy : 0);
    this._dispatchScrollEvent();
  }

  private _dispatchScrollEvent() {
    if (this._inTransction) {
      return;
    }
    this.dispatch('scroll', new SyntheticEvent('scroll', {
      timeStamp: Date.now(),
      bubbles: false,
      original: undefined,
    }));
  }

  private _attachScrollBar() {
    const { scrollThumbColor, scrollThumbHoverColor } = this.attr;
    const commonBarAttr: RectAttr = {
      draggable: true,
      stroke: 'rgba(0,0,0,0)',
      lineWidth: 8,
      r: 5,
      fill: scrollThumbColor,
      transitionProperty: 'none',
      onMouseEnter: e => e.target.setAttr({ fill: scrollThumbHoverColor }),
      onMouseLeave: e => e.target.setAttr({ fill: scrollThumbColor }),
      getDragOffset: () => {
        return { x: 0, y: 0 };
      },
    };
    this._horizontalScrollBar = new Rect({
      key: 'scrollbar-x',
      ...commonBarAttr,
      onDrag: e => {
        const item = e.target.parentNode as ScrollView;
        const scaleX = item.clientWidth / item.attr.scrollWidth;
        (item as this)._eventScrollBy(item, e.dx / scaleX, 0);
      },
    });
    this._verticalScrollBar = new Rect({
      key: 'scrollbar-y',
      ...commonBarAttr,
      onDrag: e => {
        const item = e.target.parentNode as ScrollView;
        const scaleY = item.clientHeight / item.attr.scrollHeight;
        (item as this)._eventScrollBy(item, 0, e.dy / scaleY);
      },
    });
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
      this.add(this._horizontalScrollTrack);
      this.add(this._horizontalScrollBar);
    }
    if (this.attr.scrollY) {
      this.add(this._verticalScrollTrack);
      this.add(this._verticalScrollBar);
    }
  }

  private _updateHorizontalBar() {
    const {
      x,
      y,
      width,
      height,
      scrollWidth,
      showScrollBar,
      scrollBarSize,
      scrollTrackColor,
      scrollTrackBorderColor,
    } = this.attr;
    const scrollThumbWidth = scrollBarSize - 5;
    const clientWidth = this.clientWidth;
    const scaleX = clientWidth / scrollWidth;
    const dx = this.scrollLeft * scaleX;
    const yposition = y + height - scrollBarSize / 2 - 0.5;
    let show = !!(scaleX < 1 && showScrollBar);
    if (showScrollBar === 'hover') {
      show = show && this._isMouseEnter;
    }
    this._horizontalScrollTrack.setAttr({
      display: show,
      opacity: 1,
      x,
      y: yposition - scrollBarSize / 2,
      width,
      height: scrollBarSize,
      fill: scrollTrackColor,
      stroke: scrollTrackBorderColor,
      lineWidth: 1,
    });
    this._horizontalScrollBar.setAttr({
      display: show,
      opacity: 1,
      x: x + dx,
      y: yposition - scrollThumbWidth / 2,
      width: clientWidth * scaleX,
      height: scrollThumbWidth,
    });
  }

  private _updateVerticalBar() {
    const {
      x,
      y,
      width,
      height,
      scrollHeight,
      showScrollBar,
      scrollBarSize,
      scrollTrackColor,
      scrollTrackBorderColor,
    } = this.attr;
    const scrollThumbWidth = scrollBarSize - 5;
    const clientHeight = this.clientHeight;
    const scaleY = clientHeight / scrollHeight;
    const dy = this.scrollTop * scaleY;
    const xposition = x + width - scrollBarSize / 2 - 0.5;
    let show = !!(scaleY < 1 && showScrollBar);
    if (showScrollBar === 'hover') {
      show = show && this._isMouseEnter;
    }
    this._verticalScrollTrack.setAttr({
      display: show,
      opacity: 1,
      x: xposition - scrollBarSize / 2,
      y,
      width: scrollBarSize,
      height,
      fill: scrollTrackColor,
      stroke: scrollTrackBorderColor,
      lineWidth: 1,
    });
    this._verticalScrollBar.setAttr({
      display: show,
      opacity: 1,
      x: xposition - scrollThumbWidth / 2,
      y: y + dy,
      width: scrollThumbWidth,
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

  private _debouncedFadeScrollBar() {
    const elements = [
      this._horizontalScrollBar,
      this._horizontalScrollTrack,
      this._verticalScrollBar,
      this._verticalScrollTrack,
    ];
    elements.forEach(item => item.animateTo({ opacity: 0 }, 500));
  }

  private _debounceStopScroll() {
    this._isScrolling = false;
  }

  private _updateDomNodeClipAndSticky() {
    let hasChildScrollView = false;
    this.traverse(item => {
      if (item.type === 'scrollView') {
        hasChildScrollView = true;
      }
      const {x, y ,textAlign, textBaseline, sticky} = (item as DOMNode).attr;
      if (sticky && !hasChildScrollView) {
        let offsetX: number = 0;
        let offsetY: number = 0;
        const bbox = item.getBBox();
        const scrollViewTop = this.attr.y + this.scrollTop;
        const scrollViewBottom = scrollViewTop + this.clientHeight;
        const scrollViewLeft = this.attr.x + this.scrollLeft;
        const scrollViewRight = scrollViewLeft + this.clientWidth;
        const boxBottom = bbox.y + bbox.height;
        const boxRight = bbox.x + bbox.width;
        if (lodash.isNumber(sticky.top) &&  scrollViewTop - bbox.y > sticky.top) {
          offsetY = scrollViewTop - bbox.y + sticky.top;
        }
        if (lodash.isNumber(sticky.bottom) && boxBottom - scrollViewBottom > sticky.bottom) {
          offsetY = scrollViewBottom - sticky.bottom - boxBottom;
        }

        if (lodash.isNumber(sticky.left) && scrollViewLeft - bbox.x > sticky.left) {
          offsetX = scrollViewLeft - bbox.x + sticky.left;
        }

        if (lodash.isNumber(sticky.right) && boxRight - scrollViewRight > sticky.right) {
          offsetX = scrollViewRight - sticky.right - boxRight;
        }
        item.setStickyOffset(offsetX, offsetY);
      }
      if (item.type === 'dom') {
        const {width, height} = (item as DOMNode).getBBox();
        const widthOffset: any = {
          left: 0,
          center: width / 2,
          right: width,
        };
        const topOffset: any = {
          top: 0,
          middle: height / 2,
          bottom: height,
        }
        const path = new Rect({
          x: this.scrollLeft - x + this.attr.x + widthOffset[textAlign],
          y: this.scrollTop - y + this.attr.y + topOffset[textBaseline],
          width: this.clientWidth,
          height: this.clientHeight,
        })
          .getPathData()
          .getSVGPathString();
        const cssclip = `path('${path}')`;
        (item as DOMNode).getContainer().style.clipPath = cssclip;
      }
    });
  }
}
