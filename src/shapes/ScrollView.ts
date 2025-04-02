import Group, { GroupAttr } from './Group';
import Element from './Element';
import Rect, { RectAttr } from './Rect';
import * as lodash from '../utils/lodash';
import type DOMNode from './DOMNode';
import { isMobile, isPC } from '../utils/env';
import { SyntheticDragEvent, SyntheticEvent } from '../event';
import { interpolateNumber } from '../interpolate';
import { cubicBezier } from '../animate/ease';

export interface ScrollViewAttr extends GroupAttr {
  x: number;
  y: number;
  width: number;
  height: number;
  scrollWidth?: number;
  scrollHeight?: number;
  scrollX?: boolean;
  scrollY?: boolean;
  initialOffset?:[number, number];
  onScroll?: (event: SyntheticEvent) => void;
  maxScrollLeft?: number;
  minScrollLeft?: number;
  maxScrollTop?: number;
  minScrollTop?: number;
  showScrollBar?: boolean | 'hover' | 'scrolling';
  scrollBarSize?: number;
  scrollThumbColor?: string;
  scrollThumbHoverColor?: string;
  scrollTrackColor?: string;
  scrollTrackBorderColor?: string;
  directionalLockEnabled?: boolean;
  bounces?: boolean;
}
const enum KEY_CODE {
  ARROW_DOWN = 40,
  ARROW_UP = 38,
  ARROW_LEFT = 37,
  ARROW_RIGHT = 39,
  PAGE_DOWN = 34,
  PAGE_UP = 33,
  HOME = 36,
  END = 35,
  SPACE = 32,
}

const LINE_HEIGHT = 40;

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

  private _lastDragEvent: SyntheticDragEvent;

  private _transitionRAF: any;

  private _isPanningScroll: boolean = false;

  private _isInTransitionScroll: boolean = false;

  private _dragStartPosition: number;
  
  private _lockedDirection: 'horizonal' | 'vertical' | undefined;

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
    this._scrollContentGroup?.setAttr({
      translateX: -this._scrollLeft,
      translateY: -this._scrollTop,
    });
    setTimeout(() => {
      this._updateHorizontalBar();
      this._updateVerticalBar();
    });
  }


  /**
   * @override
   */
  protected getChildrenContainer(): Group {
    return this._scrollContentGroup;
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
      tabIndex: -1,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      scrollWidth: 0,
      scrollHeight: 0,
      scrollX: false,
      scrollY: false,
      initialOffset: [0, 0],
      showScrollBar: false,
      scrollBarSize: 11,
      scrollThumbColor: '#e0e0e0',
      scrollThumbHoverColor: '#c1c1c1',
      scrollTrackColor: '#fafafa',
      scrollTrackBorderColor: '#ebebeb',
      bounces: true,
    };
  }

  public get clientWidth() {
    const { showScrollBar, scrollY, height, scrollHeight, width, scrollBarSize } = this.attr;
    return showScrollBar && scrollY && height < scrollHeight ? width - scrollBarSize : width;
  }

  public get clientHeight() {
    const { showScrollBar, scrollX, width, height, scrollWidth, scrollBarSize } = this.attr;
    return showScrollBar && scrollX && width < scrollWidth ? height - scrollBarSize : height;
  }

  public get scrollLeft(): number {
    return this._scrollLeft || 0;
  }

  public set scrollLeft(x: number) {
    if (!this._isInTransitionScroll && this.isConnected) {
      this.ownerRender.cancelAnimationFrame(this._transitionRAF);
    }
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
    if (!this._isInTransitionScroll && this.isConnected) {
      this.ownerRender.cancelAnimationFrame(this._transitionRAF);
    }
    const { height, scrollHeight, maxScrollTop, bounces } = this.attr;
    const minScrollTop = bounces ? (this._isPanningScroll || this._transitionRAF ? 0 : 0) : 0;
    const scrollTop = lodash.clamp(y, minScrollTop, maxScrollTop || scrollHeight - height);
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

  public scrollTo(x: number, y: number): void;

  public scrollTo(options: ScrollToOptions): void;

  public scrollTo(x: unknown, y?: unknown) {
    const { scrollLeft, scrollTop } = this;
    let left: number = 0;
    let top: number = 0;
    let behavior: ScrollBehavior = 'auto';
    if (x && lodash.isObject(x)) {
      const scrollOptions = x as ScrollToOptions;
      left = scrollOptions.left ?? 0;
      top = scrollOptions.top ?? 0;
      behavior = scrollOptions.behavior ?? 'auto';
    } else {
      left = (x as number) ?? 0;
      top = (y as number) ?? 0;
    }

    const applyScroll = (x: number, y: number) => {
      const { scrollLeft: prevLeft, scrollTop: prevTop} = this;
      this._inTransction = true;
      this.scrollLeft = x;
      this.scrollTop = y;
      this._inTransction = false;
      if (this.scrollLeft !== prevLeft || this.scrollTop !== prevTop) {
        this._dispatchScrollEvent();
      }
    };

    if (behavior === 'smooth') {
      this.addAnimation({
        from: {} as any,
        to: {} as any,
        ease: 'CubicIn',
        stopped: false,
        during: 300,
        delay: 0,
        onFrame: (e: number) => {
          applyScroll(interpolateNumber(scrollLeft, left, e), interpolateNumber(scrollTop, top, e));
        },
      });
    } else {
      applyScroll(left, top);
    }
  }

  public mounted() {
    super.mounted();
    const [initialOffsetX, initialOffsetY] = this.attr.initialOffset || [0, 0];
    this.scrollTo(initialOffsetX, initialOffsetY);
    this._updateDomNodeClipAndSticky();
  }

  protected created() {
    const { x, y, width, height } = this.attr;
    const clipRect = new Rect({ x, y, width, height });
    const clipGroup = (this._clipGroup = new Group({
      key: 'clip-group',
      clip: clipRect,
      draggable: isMobile,
      getDragOffset: () => {
        return { x: 0, y: 0 };
      },
      onDragStart: () => {
        this.ownerRender.cancelAnimationFrame(this._transitionRAF);
        this._transitionRAF = null;
      },
      onDrag: e => {
        if (isMobile) {
          this._isPanningScroll = true;
          this._lastDragEvent = e;
          this._eventScrollBy(e.currentTarget.parentNode as ScrollView, -e.dx, -e.dy);
        }
      },
      onDragEnd: event => {
        if (!event || !this._lastDragEvent) {
          return;
        }
        // iScroll https://wzes.github.io/2019/10/23/JavaScript/iScroll/index.html

        const during = event.timeStamp - this._lastDragEvent.timeStamp;
        this._isPanningScroll = false;
        const rAF = this.ownerRender.requestAnimationFrame
        let {dx, dy} = this._lastDragEvent;
        const { scrollX, scrollY, width, height, scrollWidth, scrollHeight } = this.attr;
        if (!scrollX || width >= scrollWidth) {
          dx = 0;
        }
        if (!scrollY || height >= scrollHeight) {
          dy = 0;
        }
        const minScrollLeft = this.attr.minScrollLeft?? 0;
        const maxScrollLeft = this.attr.maxScrollLeft ?? this.attr.scrollWidth - this.clientWidth;
        const maxScrollTop = this.attr.maxScrollTop ?? this.attr.scrollHeight - this.clientHeight;
        const minScrollTop = this.attr.minScrollTop ?? 0;
        this._lastDragEvent = null;
        const speed = Math.sqrt(dx * dx + dy * dy);
        // 超出边界回弹

        if (during > 300 || speed === 0) {
          return;
        }
        const startTime = Date.now();
        const deceleration = 0.3;
        const frameCount = Math.abs(speed) / deceleration;
        const initialLeft = this.scrollLeft;
        const initialTop = this.scrollTop;
        const maxMoveMent = speed * frameCount - 1 / 2 * deceleration * frameCount ** 2;
        const ease = cubicBezier(0, .5, .2, 1);
        const transitionScroll = () => {
          this._isInTransitionScroll = true;
          const t = Math.min((Date.now() - startTime) / 16, frameCount) / frameCount;
          const movement = ease(t) * maxMoveMent;
          const nextScrollLeft = dx !== 0 ? initialLeft - movement * (dx > 0 ? 1 : -1) : initialLeft;
          const nextScrollTop =  dy !== 0 ? initialTop - movement * (dy > 0 ? 1 : -1) : initialTop;
          this.scrollLeft = nextScrollLeft;
          this.scrollTop = nextScrollTop;
          this._isInTransitionScroll = false;
          const isYOverflow = nextScrollTop < minScrollTop || nextScrollTop > maxScrollTop;
          const isXOverflow = nextScrollLeft < minScrollLeft || nextScrollLeft > maxScrollLeft;
          if (isXOverflow && isYOverflow) {
            this._transitionRAF = null;
            return;
          }
          if (t < 1) {
            this._transitionRAF = rAF(transitionScroll)
          } else {
            this._transitionRAF = null;
          }
        }
        this._transitionRAF = rAF(transitionScroll);
      }
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
        if (this._transitionRAF) {
          return;
        }
        const _this = event.currentTarget as ScrollView;
        const { scrollTop, scrollLeft, clientWidth, clientHeight, attr } = _this;
        const { scrollX, scrollY } = attr;
        const isToBottom = scrollTop + clientHeight - attr.scrollHeight === 0;
        const isToRight = scrollLeft + clientWidth - attr.scrollWidth === 0;
        const { pixelX, pixelY } = event.normalizeWheel;
        const nopreventX =
          pixelX === 0 ||
          !_this.attr.scrollX ||
          (_this.scrollLeft === 0 && pixelX < 0) ||
          (isToRight && pixelX > 0);
        const nopreventY =
          pixelY === 0 ||
          !_this.attr.scrollY ||
          (_this.scrollTop === 0 && pixelY < 0) ||
          (isToBottom && pixelY > 0);
        if (!(nopreventX && nopreventY)) {
          this._isScrolling = true;
        }

        if (this._isScrolling) {
          event.nativePreventDefault();
          this._debounceStopScroll();
          this._defaultScrollBy(event, scrollX ? pixelX : 0, scrollY ? pixelY : 0);
        }

      },
      onKeyDown: function (event) {
        const _this = event.currentTarget as ScrollView;
        const { scrollTop, scrollLeft, clientWidth, clientHeight, attr } = _this;
        const { scrollX, scrollY } = attr;
        const bottomEnd = attr.scrollHeight - clientHeight;
        const isToBottom = scrollTop + clientHeight - attr.scrollHeight === 0;
        const isToRight = scrollLeft + clientWidth - attr.scrollWidth === 0;
        const scrollTopMap: any = {
          [KEY_CODE.ARROW_DOWN]: event.metaKey ? bottomEnd : scrollTop + LINE_HEIGHT,
          [KEY_CODE.ARROW_UP]: event.metaKey ? 0 : scrollTop - LINE_HEIGHT,
          [KEY_CODE.HOME]: 0,
          [KEY_CODE.END]: attr.scrollHeight - clientHeight,
          [KEY_CODE.SPACE]: scrollTop + (event.shiftKey ? -clientHeight : clientHeight),
          [KEY_CODE.PAGE_DOWN]: scrollTop + clientHeight,
          [KEY_CODE.PAGE_UP]: scrollTop - clientHeight,
        };
        const scrollLeftMap: any = {
          [KEY_CODE.ARROW_LEFT]: scrollLeft - 40,
          [KEY_CODE.ARROW_RIGHT]: scrollLeft + 40,
        };
        const targetTop =   scrollY ? scrollTopMap[event.keyCode] ?? scrollTop : scrollTop;
        const targetLeft =  scrollX ? scrollLeftMap[event.keyCode] ?? scrollLeft : scrollLeft;
        const deltaTop = targetTop - scrollTop;
        const deltaLeft = targetLeft - scrollLeft;
        let yScrolled = scrollY;
        let xSCrolled = scrollX;
        // 优化，考虑双向滚动，或未开启scroll
        if (scrollLeft === 0 && deltaLeft <= 0 || isToRight && deltaLeft >= 0) {
          xSCrolled = false;
        }
        if (scrollTop === 0 && deltaTop <= 0 || isToBottom && deltaTop >= 0) {
          yScrolled = false;
        }
        if (xSCrolled || yScrolled) {
          event.nativePreventDefault();
          _this._defaultScrollBy(event, deltaLeft, deltaTop);
        }
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
    this._initScrollBar();
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
  }

  private _defaultScrollBy(event: SyntheticEvent, dx: number, dy: number) {
    const target = event.currentTarget as ScrollView;
    event.setDefaultHandle(() => {
      target.scrollBy(dx, dy);
    });
  }

  private _dispatchScrollEvent() {
    if (this._inTransction) {
      return;
    }
    this.dispatch(
      'scroll',
      new SyntheticEvent('scroll', {
        timeStamp: Date.now(),
        bubbles: false,
        original: undefined,
      }),
    );
  }

  private _initScrollBar() {
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
      onDragStart: e => {
        const item = e.target.parentNode as ScrollView
        item._dragStartPosition = item.scrollLeft;
      },
      onDrag: e => {
        const item = e.target.parentNode as ScrollView as this;
        const scaleX = item.clientWidth / item.attr.scrollWidth;
        const movement = item._dragStartPosition + (e.x - e.startX) / scaleX - item.scrollLeft;
        (item as this)._eventScrollBy(item, movement, 0);
      },
    });
    this._verticalScrollBar = new Rect({
      key: 'scrollbar-y',
      ...commonBarAttr,
      onDragStart: e => {
        const item = e.target.parentNode as ScrollView;
        item._dragStartPosition = item.scrollTop;
      },
      onDrag: e => {
        const item = e.target.parentNode as ScrollView as this;
        const scaleY = item.clientHeight / item.attr.scrollHeight;
        const movement = item._dragStartPosition + (e.y - e.startY) / scaleY - item.scrollTop;
        item._eventScrollBy(item, 0, movement);
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
      scrollHeight,
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
    const yPosition = y + Math.min(height, scrollHeight) - scrollBarSize / 2 - 0.5;
    let show = !!(scaleX < 1 && showScrollBar);
    if (showScrollBar === 'hover') {
      show = show && this._isMouseEnter;
    }
    this._horizontalScrollTrack.setAttr({
      display: show,
      opacity: 1,
      x,
      y: yPosition - scrollBarSize / 2,
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
      y: yPosition - scrollThumbWidth / 2,
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
      scrollWidth,
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
    const xPosition = x + Math.min(width, scrollWidth) - scrollBarSize / 2 - 0.5;
    let show = !!(scaleY < 1 && showScrollBar);
    if (showScrollBar === 'hover') {
      show = show && this._isMouseEnter;
    }
    this._verticalScrollTrack.setAttr({
      display: show,
      opacity: 1,
      x: xPosition - scrollBarSize / 2,
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
      x: xPosition - scrollThumbWidth / 2,
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
      const { x, y, textAlign, textBaseline, sticky } = (item as DOMNode).attr;
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
        if (lodash.isNumber(sticky.top) && scrollViewTop - bbox.y > sticky.top) {
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
        const { width, height } = (item as DOMNode).getBBox();
        const widthOffset: any = {
          left: 0,
          center: width / 2,
          right: width,
        };
        const topOffset: any = {
          top: 0,
          middle: height / 2,
          bottom: height,
        };
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
