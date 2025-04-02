import type { Options as RoughOptions, Drawable } from 'roughjs/bin/core';
import Eventful from '../utils/Eventful';
import type Render from '../render';
import type CanvasPainter from '../painter/CanvasPainter';
import type SVGPainter from '../painter/SVGPainter';
import Group, { GroupAttr } from './Group';
import * as lodash from '../utils/lodash';
import { ColorValue } from '../color';
import AnimateAble, { AnimateConf, AnimateOption } from '../abstract/AnimateAble';
import { EasingName, parseEase,} from '../animate/ease';
import { Transition } from '../animate/Transition';
import { interpolate } from '../interpolate';
import interpolatePath from '../interpolate/interpolatePath';
import interpolateColor from '../interpolate/interpolateColor';
import { TransformConf } from '../abstract/TransformAble';
import { EventConf, RenderEventHandleParam } from '../event';
import Shape, { ShapeAttr } from './Shape';
import Marker from './Marker';
import * as mat3 from '../../js/mat3';
import { Vec2, transformMat3, vec2BBox, createVec2 } from '../utils/vec2';
import * as transformUtils from '../utils/transform';
import { RGBA_TRANSPARENT, IDENTRY_MATRIX } from '../constant';
import { BBox, unionBBox, ceilBBox, createZeroBBox, inBBox } from '../utils/bbox';
import { RefObject } from '../utils/ref';
import { getSVGStyleAttributes } from '../svg/style';
import Shadow from '../svg/Shadow';
import Path2D from '../geometry/Path2D';
import type Path from '../shapes/Path';
import { HookElement } from '../react/hooks';
import { SyntheticAnimationEvent, SyntheticTransitionEvent } from '../event';
import { TextAttr } from './Text';
import { parseCssGradient, isCssGradient } from '../color/css-gradient-parser';
import type ScrollView from './ScrollView';
import { TypeCustomElement } from './CustomElement';

export type ElementAttr = GroupAttr & ShapeAttr & { [key: string]: any };

export const defaultSetting: { during: number; ease: EasingName } = {
  during: 300,
  ease: 'CubicOut',
};

const reuseBBoxVectors: Vec2[] = [createVec2(), createVec2(), createVec2(), createVec2()];

export interface BaseAttr extends TransformConf, EventConf {
  key?: string | number;
  ref?: RefObject<Element>;
  data?: any;
  display?: boolean;
  markerStart?: Marker;
  markerEnd?: Marker;

  zIndex?: number; // deprecated

  fill?: ColorValue | ColorValue[];
  stroke?: ColorValue;
  color?: ColorValue
  strokeNoScale?: boolean;
  lineWidth?: number;
  pickingBuffer?: number;
  lineDash?: number[];
  lineDashOffset?: number;
  lineJoin?: CanvasLineJoin;
  lineCap?: CanvasLineCap;
  miterLimit?: number;

  opacity?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
  blendMode?:
  'source-over'|
  'source-in'|
  'source-out'|
  'source-atop'|
  'destination-over'|
  'destination-in'|
  'destination-out'|
  'destination-atop'|
  'lighter'|
  'copy'|
  'xor'|
  'multiply'|
  'screen'|
  'overlay'|
  'darken'|
  'lighten'|
  'color-dodge'|
  'color-burn'|
  'hard-light'|
  'soft-light'|
  'difference'|
  'exclusion'|
  'hue'|
  'saturation'|
  'color'|
  'luminosity';

  clip?: Shape | RefObject<Shape>;

  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  cursor?: string;
  pointerEvents?: 'none' | 'auto' | 'bounding-box';
  showBBox?: boolean;
  showBoundingRect?: boolean;
  children?: any;
}

export interface CommonAttr<T extends BaseAttr = BaseAttr> extends BaseAttr {
  transitionProperty?: 'all' | 'none' | Array<keyof T>;
  transitionEase?: EasingName;
  transitionDuration?: number;
  transitionDelay?: number;
  tabIndex?: number;
  animation?: {
    from: ElementAttr;
    to: ElementAttr;
    during?: number;
    ease?: EasingName;
    delay?: number;
  };
  sticky?: {top?: number; left?: number; right?: number; bottom?: number};
  stateStyles?: Record<string, ElementAttr>;
  hoverStyle?: ElementAttr;
  selectedStyle?: ElementAttr;
  focusStyle?: ElementAttr;
  activeStyle?: ElementAttr;
  className?: string;
  rough?: boolean;
  roughOptions?: RoughOptions;
}

type Status =
  | 'hover'
  | 'focus'
  | 'selected'
  | 'checked'
  | 'active';
type StatusConfig = Partial<Record<string, boolean>>;

export const defaultCanvasContext: ShapeAttr = {
  fill: 'none',
  stroke: 'none',
  lineWidth: 1,
  lineDash: null,
  lineDashOffset: 0,
  lineJoin: 'bevel', // default to be miter
  lineCap: 'butt',
  miterLimit: 10,
  fillOpacity: 1,
  strokeOpacity: 1,
  blendMode: 'source-over',
  fontSize: 12, // not default canvas context value
  fontFamily: 'sans-serif',
  fontWeight: 'normal',
  fontStyle: 'normal',
  fontVariant: 'normal',
  textAlign: 'start',
  textBaseline: 'bottom', // canvas default value 'alphabetic',
  shadowColor: RGBA_TRANSPARENT,
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  cursor: 'auto',
  pointerEvents: 'auto',
};
const extendAbleKeys = Object.keys(defaultCanvasContext);

export const transformKeys: Array<keyof CommonAttr> = [
  'rotation',
  'scaleX',
  'scaleY',
  'translateX',
  'translateY',
  'originX',
  'originY',
  'matrix',
];

const animationKeysMap: Record<string, Array<keyof ShapeAttr>> = {};

const defaultTRansformConf: CommonAttr = {
  originX: 0,
  originY: 0,
  translateX: 0,
  translateY: 0,
  scaleX: 1,
  scaleY: 1,
  origin: [0, 0],
  position: [0, 0],
  scale: [0, 0],
};

let nodeId = 1;
export default class Element<T extends CommonAttr = ElementAttr>
  extends Eventful<RenderEventHandleParam>
  implements AnimateAble<T>
{
  public static createPath: () => Path;

  public static $$isElement: boolean = true;

  public static isHookElement(obj: unknown): obj is HookElement {
    return (obj as Element).type === 'function-component';
  }

  public static isElementConstructor(obj: unknown): obj is Element {
    return obj && (obj as Element).$$isElement;
  }

  public $$isElement: boolean = true;

  public $$portal: Element = null;

  public id: number;

  public attr: T & CommonAttr = {} as T;

  public type: string;

  public svgTagName: string = 'path';

  public parentNode: Group | null = null;

  public firstChild: Element = null;

  public lastChild: Element = null;

  public prevSibling: Element = null;

  public nextSibling: Element = null;

  public ownerRender: Render | null = null;

  public isClip: boolean;

  public pickRGB: [number, number, number];

  public readonly shapeKeys: Array<keyof T> = [];

  public fillAble: boolean = true;

  public strokeAble: boolean = true;

  public needFill: boolean = false;

  public needStroke: boolean = false;

  protected _cacheRough: Drawable;

  private _dirty: boolean = true;

  private _animations: AnimateOption<T>[] = [];

  private _transitions: Transition[] = [];

  private _isTransitionUpdated: boolean = false;

  private _bbox: BBox;

  private _bboxDirty: boolean = true;

  private _transform: mat3;

  private _absTransform: mat3;

  private _transformDirty: boolean = false;

  private _absTransformDirty: boolean = true;

  private _clientBoundingRect: BBox;

  private _clientBoundingRectDirty: boolean = true;

  private _dirtyRect: BBox;

  private _dragOffset: [number, number] = createVec2();

  private _currentPaintArea: BBox;

  private _currentPaintAreaDirty: boolean = true;

  private _lastFrameTime: number;

  private _shadow: Shadow;

  private _inTransaction: boolean = false;

  private _hasBeenPainted: boolean = false;

  private _inFrameAble: boolean;

  protected _refElements: Set<Element> | undefined;

  private _statusConfig: StatusConfig = null;

  private _attr: T;

  private _transitionAttr: T;

  private _stickOffsetX: number = 0;

  private _stickOffsetY: number = 0;
  
  public constructor(attr?: T) {
    super();
    this.id = nodeId++;
    this.attr = this._attr = this.getDefaultAttr();
    attr && this.setAttr(attr);
    this.created();
  }

  public get dataset(): unknown {
    return this.attr.data;
  }

  public get className(): string {
    return this.attr.className || '';
  }

  public get isConnected(): boolean {
    return !!this.ownerRender;
  }

  public getAnimationKeys(): Array<keyof T> {
    return [
      'fill',
      'stroke',
      'color',
      'lineWidth',
      'lineDash',
      'lineDashOffset',
      'opacity',
      'fillOpacity',
      'strokeOpacity',
      'rotation',
      'translateX',
      'translateY',
      'scaleX',
      'scaleY',
      'originX',
      'originY',
      'matrix',
      'shadowColor',
      'shadowBlur',
      'shadowOffsetX',
      'shadowOffsetY',
    ] as Array<keyof CommonAttr>;
  }

  public getDefaultAttr(): T {
    return {
      display: true,
      // opacity: 1,
      // draggable: false,
      // rotation: 0,
      // strokeNoScale: false,
    } as T;
  }

  protected onEvent(type: string, ...params: any[]) {
    const eventKey = Object.keys(this.attr).filter(
      key => key.toLowerCase() === 'on' + type,
    )[0] as keyof EventConf;
    if (eventKey) {
      (this.attr[eventKey] as Function).apply(null, params);
    }
    switch (type) {
      case 'mouseenter':
        this.setState('hover', true);
        break;
      case 'mouseleave':
        this.setState('hover', false);
        break;
      case 'mousedown':
        this.setState('active', true);
        break;
      // case 'mouseup':// trigger in event handle
      //   this.setState('active', false);
      //   break;
      case 'focus':
        this.setState('focus', true);
        break;
      case 'blur':
        this.setState('focus', false);
        break;
    }
    this._attr.onEvent?.apply(null, params);
  }

  public getComputedOpacity(): number {
    let node: Element<T> | Group = this;
    let opacity = 1;
    while (node) {
      opacity *= node.attr.opacity ?? 1;
      node = node.parentNode as any as Group;
    }
    return opacity;
  }

  public getExtendAttr<U extends keyof T>(key: U): T[U] {
    let value: T[U] = (defaultCanvasContext as T)[key];
    let node: Element<any> = this;
    while (node) {
      if (typeof node.attr[key] !== 'undefined') {
        value = node.attr[key];
        break;
      }
      node = node.parentNode;
    }

    if ((key === 'fill' || key === 'stroke') && value === ('currentColor' as any)) {
      return this.getExtendAttr('color') as T[U];
    }

    if (key !== 'lineWidth' || !this.attr.strokeNoScale) {
      return value;
    }
    const globalTransform = this.getGlobalTransform();
    const scale = globalTransform[0];
    return ((value as any as number) / scale) as any;
  }

  public hasFill(): boolean {
    const fill = this.getExtendAttr('fill');
    return fill && fill !== 'none' && (fill as ColorValue[]).length !== 0
  }

  public hasStroke() {
    const stroke = this.getExtendAttr('stroke');
    return stroke && stroke !== 'none';
  }

  public contains(child: Element): boolean {
    let node = child;
    while (node) {
      if ((node as any) === this) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  public closest(match: (node: Element) => boolean): Element | undefined {
    let node = this as any as Element;
    while (node) {
      if (match(node)) {
        return node;
      }
      node = node.parentNode;
    }
  }

  public getAncestorNodes(containSelf: boolean = true): Element[] {
    let node = containSelf ? this : this.parentNode;
    const out: Element[] = [];
    while (node) {
      out.push(node as Element);
      node = node.parentNode;
    }
    return out;
  }

  public getComputedAttr(): T {
    // todo
    return {
      ...defaultCanvasContext,
      ...(this.parentNode ? lodash.pick(this.parentNode.attr, extendAbleKeys) : null),
      ...this.attr,
    };
  }

  public getUserAttr(): T {
    return this._attr;
  }

  public setAttr<U extends keyof T | T>(
    attr: U,
    value?: U extends keyof T ? T[U] : undefined,
  ): this {
    if (!attr) {
      return this;
    }
    if (typeof attr === 'string') {
      if (this._attr[attr as keyof T] === value) {
        return;
      }
      this.dirty();
      const oldValue = this._attr[attr as keyof T];
      if (value !== undefined) {
        this._attr[attr as keyof T] = value;
      } else {
        delete this._attr[attr as keyof T];
        if (this.ownerRender && this.ownerRender.renderer === 'svg') {
          this._removeSVGAttribute(attr as string);
        }
      }
      this.onAttrChange(attr as keyof T, value, oldValue);
    } else if (typeof attr === 'object') {
      this.prevProcessAttr(attr as T);
      let dirty = false;
      for (const key in attr as T) {
        const prevValue = this._attr[key as keyof T];
        const nextValue = (attr as T)[key];
        if (prevValue !== nextValue) {
          if (!dirty) {
            dirty = true;
            this.dirty();
          }
          this._attr[key] = nextValue;
          this.onAttrChange(key, nextValue, prevValue);
        }
      }
    }

    if (!this._inTransaction) {
      this.afterAttrChanged();
    }

    return this;
  }

  public replaceAttr(nextAttr: T, transition: boolean): void {
    const prevAttr = this._attr;
    const {
      transitionDuration = defaultSetting.during,
      transitionEase = defaultSetting.ease,
      transitionProperty = 'all',
      transitionDelay = 0,
    } = nextAttr;
    this.startAttrTransaction();
    for (const key in prevAttr) {
      if (!(key in nextAttr)) {
        this.removeAttr(key as any);
      }
    }

    if (!transition || transitionProperty === 'none' || transitionProperty.length === 0) {
      this.setAttr(nextAttr);
    } else {
      const transitionAttr =
        transitionProperty === 'all' ? nextAttr : lodash.pick(nextAttr, transitionProperty as any);
      this
        .stopAllAnimation()
        .animateTo(transitionAttr, transitionDuration, transitionEase, null, transitionDelay);
    }
    if ((this as any as TypeCustomElement).$$CustomType) {
      (this as any as TypeCustomElement).skipUpdate();
    }
    this.endAttrTransaction();
  }

  public removeAttr(attribute: keyof T) {
    this.setAttr(attribute, undefined);
  }

  public setState(state: Status, value: boolean) {
    if (!this._statusConfig) {
      this._statusConfig = {};
    }
    const statusStyle = this._getStatusStyle(state);
    const prevValue = this._statusConfig[state] || false;

    this._statusConfig[state] = value;
    if (statusStyle&& prevValue !== value) {
      this.dirtyStatusAttr(statusStyle);
    }
  }

  public getState(state: Status): boolean {
    return (this._statusConfig || {})[state] || false;
  }

  private updateCascadeAttr() {
    this.dirty();
    const stateStyles = this._attr.stateStyles;
    const statusConfig = this._statusConfig;
    const statusList = Object.keys(stateStyles || {}).concat('hover', 'focus', 'selected', 'active');
    const cascadingAttr: T = { ...this._attr };
    for (const status of statusList) {
      const keyAttr = this._getStatusStyle(status);
      if (keyAttr && statusConfig[status]) {
        Object.assign(cascadingAttr, keyAttr);
      }
    }
    Object.assign(cascadingAttr, this._transitionAttr);
    this.attr = cascadingAttr;
  }

  private dirtyStatusAttr(attr: T) {
    const oldAttr = this.attr;
  
    // todo cancel exist transition
    this._transitionAttr = {} as any;
    this._transitions = [];

    this.updateCascadeAttr();

    this._isTransitionUpdated = true;
    for (const key in attr) {
      const oldValue = oldAttr[key];
      const newValue = this.attr[key];
      if (oldValue !== newValue) {
        this.onAttrChange(key, newValue, oldValue);
      }
    }
    this._isTransitionUpdated = false;
  }

  public show() {
    this.setAttr('display', true as any);
  }

  public hide() {
    this.setAttr('display', false as any);
  }

  public focus(options?: { preventScroll?: boolean }) {
    this.ownerRender?.getEventHandle().focusElement(this, options);
  }

  public blur() {
    this.ownerRender?.getEventHandle().blurElement(this);
  }

  public scrollIntoView(scrollOptions: boolean | ScrollIntoViewOptions = true): void {
    const scrollView = this.closest(node => node.type === 'scrollView') as ScrollView;
    if (!scrollView) {
      return;
    }
    const itemBBox = this.getBBox();
    let scrollTop: number;
    let scrollLeft: number;
    let behavior: ScrollBehavior = 'smooth';
    const topMap = {
      start: itemBBox.y -  scrollView.attr.y,
      center: itemBBox.y + itemBBox.height / 2 - scrollView.attr.y - scrollView.clientHeight / 2,
      end:  itemBBox.y - scrollView.attr.y - scrollView.clientHeight + itemBBox.height,
      nearest: 0,
    };
    const currentScrollTop = scrollView.scrollTop;
    const currentScrollLeft = scrollView.scrollLeft;
    topMap.nearest = Math.abs(currentScrollTop - topMap.start) < Math.abs(currentScrollTop - topMap.end) ? topMap.start : topMap.end;
    const leftMap = {
      start: itemBBox.x - scrollView.attr.x,
      center: itemBBox.x + itemBBox.width / 2 - scrollView.attr.x - scrollView.clientWidth / 2,
      end:  itemBBox.x - scrollView.attr.x - scrollView.clientWidth + itemBBox.width,
      nearest: 0,
    };
    leftMap.nearest = Math.abs(currentScrollLeft - leftMap.start) < Math.abs(currentScrollLeft - leftMap.end) ? leftMap.start : leftMap.end;

    if (lodash.isBoolean(scrollOptions)) {
      if (scrollOptions === true) {
        scrollTop = topMap.start;
      } else {
        scrollTop = topMap.end;
      }
      scrollLeft = leftMap.start;
    } else {
      const { block = 'start', inline = 'nearest', } = scrollOptions;
      behavior = scrollOptions.behavior || behavior;
      scrollTop = topMap[block];
      scrollLeft = leftMap[inline];
    }
    scrollView.scrollTo({
      top: scrollTop,
      left: scrollLeft,
      behavior,
    });
  }

  public startAttrTransaction() {
    this._inTransaction = true;
  }

  public endAttrTransaction() {
    this._inTransaction = false;
    this.afterAttrChanged();
  }

  public get isGroup(): boolean {
    return this.type === 'group';
  }

  public beforeDirty(leafNodeSize: number) {
    const maxDirtyLimit = this.ownerRender.maxDirtyRects;
    if (
      !this.ownerRender.enableDirtyRect ||
      this.ownerRender.getDirtyElements().size > maxDirtyLimit ||
      leafNodeSize > maxDirtyLimit
    ) {
      this._dirtyRect = undefined;
      return;
    }
    if (!this._dirty && this._hasBeenPainted) {
      this._dirtyRect = this.getCurrentDirtyRect();
    }
  }

  public isDirty(): boolean {
    return this._dirty;
  }

  protected onChildDirty(): void {
    // nothing;
  }

  public dirty(isRef = false) {
    let leafNodeSize = 1;
    if (
      this.ownerRender &&
      this.ownerRender.renderer === 'canvas' &&
      this.ownerRender.enableDirtyRect
    ) {
      this._refElements?.forEach(item => item.dirty(true));
      this.parentNode?.onChildDirty();
      if (this.isGroup) {
        leafNodeSize = (this as any as Group).getLeafNodesSize(this.ownerRender.maxDirtyRects + 1);
        this.beforeDirty(leafNodeSize);
      } else {
        this.beforeDirty(leafNodeSize);
      }
    }
    this._dirty = true;
    if (this.ownerRender) {
      this.ownerRender.dirty(this);
      if (this.isGroup && this.ownerRender.renderer === 'canvas') {
        if (leafNodeSize > this.ownerRender.maxDirtyRects) {
          (this.ownerRender.getPainter() as CanvasPainter).noDirtyRectNextFrame();
        }
      }
    }
    if (this.attr.clip && this.ownerRender) {
      this._mountClip();
    }
  }

  public clearDirty() {
    this._hasBeenPainted = true;
    this._dirty = false;
  }

  public get childNodes(): Element[] {
    return this.children();
  }

  public replaceWith(node: Element) {
    const parent = this.parentNode;
    if (parent) {
      parent.replaceChild(this as any, node);
    }
  }

  public children(): Element[] {
    const ret: Element[] = [];
    let node = this.firstChild;
    while (node) {
      ret.push(node);
      node = node.nextSibling;
    }
    node = null;
    return ret;
  }

  public getShadowObj(): Shadow {
    if (!this._shadow) {
      this._shadow = new Shadow();
    }
    this._shadow.setShadow(
      this.attr.shadowColor,
      this.attr.shadowBlur,
      this.attr.shadowOffsetX,
      this.attr.shadowOffsetY,
    );
    return this._shadow;
  }

  public getBBox(): BBox {
    if (!this._bbox || this._bboxDirty) {
      this._bbox = this.computeBBox();
      this._bboxDirty = false;
    }
    return this._bbox;
  }

  public getBoundingClientRect(): BBox {
    if (this.attr.display === false) {
      return createZeroBBox();
    }
    if (!this._clientBoundingRect || this._clientBoundingRectDirty) {
      this._clientBoundingRect = this.computeBoundingClientRect(
        this._clientBoundingRect || createZeroBBox(),
      );
      this._clientBoundingRectDirty = false;
    }
    return this._clientBoundingRect;
  }

  public getDirtyRects(): [BBox] | [BBox, BBox] {
    const prevBBox = this._dirtyRect;
    const currentBBox = this.getCurrentDirtyRect();
    if (prevBBox) {
      return [prevBBox, currentBBox];
    }
    return [currentBBox];
  }

  public getCurrentDirtyRect(): BBox {
    if (!this._currentPaintArea || this._currentPaintAreaDirty) {
      this._currentPaintArea = this.computeCurrentDirtyRect();
      this._currentPaintAreaDirty = false;
    }
    return this._currentPaintArea;
  }

  public addRef(el: Element) {
    if (!el) {
      return;
    }
    if (!this._refElements) {
      this._refElements = new Set();
    }
    this._refElements.add(el);
  }

  public removeRef(el: Element) {
    this._refElements?.delete(el);
  }

  protected computeCurrentDirtyRect(): BBox {
    if (this.attr.display === false) {
      return createZeroBBox();
    }
    const { markerStart, markerEnd } = this.attr;
    const boundingRect = this.getBoundingClientRect();
    const { x, y, width, height } = boundingRect;
    const shadowBlur = this.getExtendAttr('shadowBlur');
    const hasSubBox = shadowBlur > 0 || markerStart || markerEnd;
    if (!hasSubBox) {
      return ceilBBox(boundingRect);
    }
    const boxList: BBox[] = [boundingRect];
    if (shadowBlur > 0) {
      const shadowOffsetX = this.getExtendAttr('shadowOffsetX');
      const shadowOffsetY = this.getExtendAttr('shadowOffsetY');
      boxList.push({
        x: x + shadowOffsetX - shadowBlur,
        y: y + shadowOffsetY - shadowBlur,
        width: width + shadowBlur * 2 + shadowOffsetX,
        height: height + shadowBlur * 2 + shadowOffsetY,
      });
    }
    if (markerStart || markerEnd) {
      if (markerStart) {
        boxList.push(markerStart.getMarkerDirtyRect(this as unknown as Shape, 'start'));
      }
      if (markerEnd) {
        boxList.push(markerEnd.getMarkerDirtyRect(this as unknown as Shape, 'end'));
      }
    }

    return ceilBBox(unionBBox(boxList));
  }

  protected computeBBox(): BBox {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  public getSvgAttributes(): any {
    return getSVGStyleAttributes(this as any);
  }

  public computeBBoxWithLocalTransform() {
    const out: BBox = {x: 0, y: 0, width: 0, height: 0};
    return this.computeBoundingClientRect(out, false);
  }

  protected computeBoundingClientRect(out: BBox, isGlobal = true): BBox {
    // todo gc optimize
    let { x, y, width, height } = this.getBBox();
    if (
      this.type === 'text' &&
      (this.attr as TextAttr).overline
    ) {
      const fontSize = (this as any).getExtendAttr('fontSize');
      y -= fontSize * 0.1;
      height += fontSize * 0.1;
    }
    const hasStroke = this.hasStroke();
    const lineWidth = hasStroke && !this.isGroup ? this.getExtendAttr('lineWidth') : 0;
    const offsetLineWidth = (Math.sqrt(2) / 2) * lineWidth;
    const matrix =  isGlobal ? this.getGlobalTransform(true) : this.getTransform(true);
    x -= offsetLineWidth;
    y -= offsetLineWidth;
    width += offsetLineWidth * 2;
    height += offsetLineWidth * 2;
    if (!matrix) {
      out.x = x;
      out.y = y;
      out.width = width;
      out.height = height;
      return out;
    }
    return this.computeBBoxWithTransform(out, x, y, width, height, matrix);
  }

  protected computeBBoxWithTransform(
    out: BBox,
    x: number,
    y: number,
    width: number,
    height: number,
    matrix: mat3,
  ): BBox {
    reuseBBoxVectors[0][0] = x;
    reuseBBoxVectors[0][1] = y;
    reuseBBoxVectors[1][0] = x + width;
    reuseBBoxVectors[1][1] = y;
    reuseBBoxVectors[2][0] = x + width;
    reuseBBoxVectors[2][1] = y + height;
    reuseBBoxVectors[3][0] = x;
    reuseBBoxVectors[3][1] = y + height;
    // const vectors: Vec2[] = [
    //   [x, y],
    //   [x + width, y],
    //   [x + width, y + height],
    //   [x, y + height],
    // ];
    reuseBBoxVectors.forEach(vec2 => transformMat3(vec2, vec2, matrix));
    return vec2BBox(reuseBBoxVectors, out);
  }

  protected created() {
    // do nothing
  }

  protected onAttrChange<U extends keyof T>(key: U, newValue: T[U], oldValue: T[U]) {
    if (newValue === oldValue) {
      return;
    }

    if (this._isTransitionUpdated) {
      const { transitionProperty, transitionDelay = 0, transitionDuration = 0, transitionEase = 'Linear' } = this.attr;
      const animatableKeys = this._getAnimationKeys();
      const transitionAble = animatableKeys.includes(key) && (transitionProperty === 'all' || (lodash.isArray(transitionProperty) && transitionProperty.includes(key as any)));
      if (transitionAble) {
        const index = this._transitions.findIndex(item => item.transitionProperty === key);
        if (index !== -1) {
         this._transitions.splice(index, 1); 
        }
        this._transitions.push({
          values: [oldValue, newValue],
          finished: false,
          startTime: 0,
          transitionProperty: key as string,
          transitionDelay,
          transitionDuration,
          transitionTimingFunction: transitionEase,
        });
        this._addToFrame();
      }

    }

    if (transformKeys.indexOf(key as keyof CommonAttr) !== -1) {
      this.dirtyTransform();
    }

    if (key === 'display') {
      this.dirtyBBox();
    }

    if (key === 'shadowBlur') {
      this._currentPaintAreaDirty = true;
    }
    
    if ((key === 'fill' || key === 'color' || key === 'stroke') && ((lodash.isString(newValue) && isCssGradient(newValue)) || lodash.isArray(newValue))) {
      if (lodash.isArray(newValue)) {
        this.attr[key] = newValue.map(item => {
          if (isCssGradient(item)) {
            return parseCssGradient(item) as any;
          }
          return item;
        }) as any;
      } else {
        this.attr[key] = parseCssGradient(newValue) as any;
      }
    }

    if (this.shapeKeys.indexOf(key) !== -1) {
      this.dirtyBBox();
    }
    // if (key === 'clip' && this.attr.clip) {
    //   const clip = this.getClipElement();
    //   if (!clip.parentNode) {
    //     clip.destroy();
    //   }
    // }
    if (key === 'clip' && this.ownerRender) {
      this._mountClip();
    }
    if (key === 'ref' && newValue) {
      (newValue as RefObject<any>).current = this;
    }
    if (key === 'lineWidth') {
      this.dirtyClientBoundingRect();
    }
  }

  protected afterAttrChanged() {
    this._cacheRough = undefined;
    if (this.attr !== this._attr) {
      this.updateCascadeAttr();
    }
  }

  public mounted() {
    if (!(this.parentNode && this.parentNode.ownerRender)) {
      return;
    }
    if (this.parentNode) {
      this.ownerRender = this.parentNode.ownerRender;
      if (this.attr.onMounted || this._animations.length) {
        this._addToFrame();
      }
    }
    if (this.attr.animation) {
      this.dispatch(
        'animationstart',
        new SyntheticAnimationEvent('animationstart', {
          bubbles: false,
          timeStamp: Date.now(),
          elapsedTime: 0,
        }),
      );
      this.addAnimation({
        stopped: false,
        during: 300,
        ease: 'Linear',
        ...(this.attr.animation as AnimateOption<T>),
        callback: () => {
          this.dispatch(
            'animationend',
            new SyntheticAnimationEvent('animationend', {
              bubbles: false,
              timeStamp: Date.now(),
              elapsedTime: 0,
            }),
          );
        },
      } as AnimateOption<T>);
    }
    this._mountClip();
  }

  public resetPickRGB() {
    this.pickRGB = null;
  }

  public pickByGPU(): boolean {
    return false;
  }

  public isInShape(ox: number, oy: number): boolean {
    const [x, y] = this.getInvertedPoint(ox, oy);
    if (this.attr.pointerEvents === 'bounding-box') {
      return inBBox(this.getBBox(), x, y);
    }
    return this.isPointOnPath(x, y);
  }

  protected isPointOnPath(x: number, y: number) {
    const hasFill = this.hasFill();
    const hasStroke = this.hasStroke();
    const lineWidth = this.getExtendAttr('lineWidth') + (this.attr.pickingBuffer || 0);
    return (
      (hasFill && this.isPointInFill(x, y)) || (hasStroke && this.isPointInStroke(x, y, lineWidth))
    );
  }

  /**
   *
   * @param x inverted x
   * @param y inverted y
   */
  public isInClip(x: number, y: number): boolean {
    let inClip = true;
    let node: Element<any> = this;
    let invertedX: number;
    let invertedY: number;
    while (inClip && node) {
      if (node.attr.clip) {
        [invertedX, invertedY] = node.getInvertedPoint(x, y);
        inClip = inClip && node.getClipElement().isPointInFill(invertedX, invertedY);
      }
      if (!inClip) {
        break;
      }
      node = node.parentNode;
    }
    return inClip;
  }

  public dirtyClipTarget(clip: Element) {
    const myclip = this.getClipElement();
    if (myclip && myclip === clip) {
      this.dirty();
    }
  }

  public getInvertedPoint(x: number, y: number): [number, number] {
    const globalTransform = this.getGlobalTransform(true);
    if (globalTransform) {
      const out = mat3.createVec3();
      const inverMatrix = mat3.invert(out, globalTransform);
      const vec2: [number, number] = [0, 0];
      transformMat3(vec2, [x, y], inverMatrix);
      return vec2;
    }
    return [x, y];
  }

  public isPointInStroke(x: number, y: number, lineWidth: number): boolean {
    x && y && lineWidth;
    return false;
  }

  public isPointInFill(x: number, y: number): boolean {
    x && y;
    return false;
  }

  public destroy() {
    if (this._inFrameAble) {
      this._removeFromFrame();
    }
    this.parentNode = null;
    this.ownerRender = null;
    this.prevSibling = this.nextSibling = this.firstChild = this.lastChild = null;
    this._transformDirty = true;
    this._absTransformDirty = true;
    this._clientBoundingRectDirty = true;
    this._bboxDirty = true;
    this._refElements?.clear();
    this._statusConfig = undefined;
    this.attr = this._attr;
    this._stickOffsetX = 0;
    this._stickOffsetY = 0;
    const clip = this.getClipElement();
    if (clip && !clip.parentNode) {
      clip.destroy();
    }
    this.stopAllAnimation();
    this._transitions.length = 0;
    this._transitionAttr = null;
    this.removeAllListeners();
  }

  public getDragOffset(): [number, number] {
    return this._dragOffset;
  }

  public animateMorphing(path: Path2D, during: number = 300) {
    const curPath = (this as any as Shape).getPathData();
    const [from, to] = Path2D.morphing(curPath, path);
    const newNode = Element.createPath().setAttr({
      ...this.attr,
      pathData: from,
    });
    this.replaceWith(newNode);
    newNode.animateTo(
      {
        pathData: to,
      },
      {
        during,
        callback: () => {
          newNode.setAttr('pathData', path);
        },
      },
    );
    return newNode;
  }

  public setDragOffset(x: number, y: number) {
    if (this._dragOffset[0] === x && this._dragOffset[1] === y) {
      return;
    }
    this._dragOffset[0] = x;
    this._dragOffset[1] = y;
    this.dirty();
    this.dirtyGlobalTransform();
  }

  public setStickyOffset(x: number, y: number) {
    this._stickOffsetX = x;
    this._stickOffsetY = y;
    this.dirty();
    this.dirtyTransform();
  }

  public dragMoveBy(dx: number, dy: number) {
    if (dx === 0 && dy === 0) {
      return;
    }
    this.dirty();
    this._dragOffset[0] += dx;
    this._dragOffset[1] += dy;
    this.dirtyGlobalTransform();
  }

  /* ************ AnimateAble Begin ******************* */

  public animateTo(
    toAttr: T,
    duringOrConf: number | AnimateConf = defaultSetting.during,
    ease: EasingName = defaultSetting.ease,
    callback?: Function,
    delay?: number,
  ) {
    this.prevProcessAttr(toAttr);
    const fromAttr = this.attr;
    let animationKeys = this._getAnimationKeys();
    animationKeys = animationKeys.filter(key => {
      const toValue = toAttr[key];
      const fromValue = fromAttr[key];
      return !(lodash.isNull(toValue) || lodash.isUndefined(toValue)) && fromValue !== toValue;
    });

    const nonAnimateAttr = lodash.omit(toAttr, animationKeys) as T;
    const animateToAttr = lodash.pick(toAttr, animationKeys);
    const animateFromAttr = lodash.pick({ ...defaultTRansformConf, ...fromAttr }, animationKeys);
    animationKeys.forEach(key => {
      const value = animateFromAttr[key];
      if (value === undefined || value === ('currentColor' as any)) {
        animateFromAttr[key] = this.getExtendAttr(key);
      }
    });
    this.setAttr(nonAnimateAttr);
    if (typeof duringOrConf === 'object') {
      this.addAnimation({
        stopped: false,
        from: animateFromAttr as T,
        to: animateToAttr,
        ...(defaultSetting as any),
        ...duringOrConf,
      });
    } else {
      this.addAnimation({
        from: animateFromAttr as T,
        to: animateToAttr,
        during: duringOrConf,
        ease,
        callback,
        delay,
        stopped: false,
      });
    }
  }

  public animateMotion(animateConf: {
    path: Path2D;
    rotate?: number | 'auto' | 'auto-reverse';
    during?: number;
    ease?: EasingName;
    callback?: Function;
    delay?: number;
  }) {
    const { path, rotate = 0, during = 300, ease = 'Linear', callback, delay = 0 } = animateConf;
    this.animateTo({} as T, {
      ease,
      during,
      delay, 
      callback,
      onFrame: (t: number) => {
        const point = path.getPointAtPercent(t);
        const matrix = mat3.createVec3();
        let theta: number = rotate as number;
        if (rotate === 'auto') {
          theta = point.alpha + Math.PI / 2;
        }
        if (rotate === 'auto-reverse') {
          theta = point.alpha - Math.PI / 2;
        }
        mat3.translate(matrix, matrix, [point.x, point.y]);
        if (theta !== 0) {
          mat3.rotate(matrix, matrix, theta);
        }
        this.setAttr('matrix', matrix as any);
      },
    });
  }

  public divide(count: number): Element[] {
    return [];
    // for morphing animate;
  }
  // eslint-disable-next-line no-unused-vars
  protected prevProcessAttr(attr: T) {
    if (attr.position) {
      attr.translateX = attr.position[0];
      attr.translateY = attr.position[1];
    }

    if (attr.scale) {
      attr.scaleX = attr.scale[0];
      attr.scaleY = attr.scale[1];
    }

    if (attr.origin) {
      attr.originX = attr.origin[0];
      attr.originY = attr.origin[1];
    }
  }

  protected addAnimation(option: AnimateOption<T>) {
    this._animations.push(option);
    this._addToFrame();
  }

  // todo gotoend support
  public stopAllAnimation(): this {
    // todo goToEnd
    this._animations.length = 0;
    return this;
  }

  public onFrame(now: number) {
    // clip element maybe usesed for muti component
    if (!now) {
      return;
    }

    if (this._lastFrameTime === now) {
      return;
    }

    if (!this._lastFrameTime && this.attr.onMounted) {
      this.attr.onMounted();
    }

    this._lastFrameTime = now;

    if (this.attr.clip) {
      const clipElement = this.getClipElement();
      clipElement && clipElement.onFrame(now);
    }

    if (!(this._animations.length || this._transitions.length)) {
      this._removeFromFrame();
      return;
    }
    this.startAttrTransaction();
    this._runAnimation(now);
    this._applyTransition(now);
    if (!(this._animations.length || this._transitions.length)) {
      this._removeFromFrame();
    }
    this.endAttrTransaction();
  }

  public getClipElement(): Shape {
    const { clip } = this.attr;
    if (!clip) {
      return;
    }
    if (clip instanceof Element) {
      return clip;
    }
    if (clip.current instanceof Element) {
      return clip.current;
    }
  }

  /* ************ AnimateAble End ******************* */

  /* ************ TransformAble Begin ******************* */

  public getTransform(nullable: boolean = false): mat3 {
    if (!this._transform || this._transformDirty) {
      this._transform = this._computeTransform();
      this._transformDirty = false;
    }
    return nullable ? this._transform : this._transform || IDENTRY_MATRIX;
  }

  public getGlobalTransform(nullable: boolean = false): mat3 {
    if (!this._absTransform || this._absTransformDirty) {
      this._absTransform = this._computeGlobalTransform();
      this._absTransformDirty = false;
    }
    return nullable ? this._absTransform : this._absTransform || IDENTRY_MATRIX;
  }

  public dirtyClientBoundingRect() {
    this._clientBoundingRectDirty = true;
    this._currentPaintAreaDirty = true;
    this.parentNode?.dirtyBBox();
  }

  private _computeTransform(): mat3 {
    const out = this._transform ? mat3.identity(this._transform) : mat3.createVec3();
    const {
      rotation = 0,
      originX = 0,
      originY = 0,
      scaleX = 1,
      scaleY = 1,
      translateX = 0,
      translateY = 0,
      matrix,
    } = this.attr;
    const offsetX = this._stickOffsetX;
    const offsetY = this._stickOffsetY;
    let flagDirty = false;
    const originXComputed = this._getOrigin(originX, 'x');
    const originYComputed = this._getOrigin(originY, 'y');
    if (translateX !== 0 || translateY !== 0) {
      flagDirty = true;
      out[6] = translateX;
      out[7] = translateY;
    }
    if (rotation !== 0) {
      flagDirty = true;
      transformUtils.rotate(out, rotation, originXComputed, originYComputed);
    }
    if (scaleX !== 1 || scaleY !== 1) {
      flagDirty = true;
      transformUtils.scale(out, scaleX, scaleY, originXComputed, originYComputed);
    }
    if (matrix) {
      flagDirty = true;
      mat3.multiply(out, out, matrix);
    }
    if (offsetX !== 0 || offsetY !== 0) {
      flagDirty = true;
      mat3.translate(out, out, [offsetX, offsetY])
    }
    return flagDirty ? out : null;
  }

  public dirtyTransform() {
    this._transformDirty = true;
    this.dirtyGlobalTransform();
  }

  public dirtyGlobalTransform() {
    this._absTransformDirty = true;
    this.dirtyClientBoundingRect();
    if (this.ownerRender && this.ownerRender.renderer === 'svg' && this.attr.strokeNoScale) {
      this.ownerRender.dirty(this);
    }
  }

  public dirtyBBox() {
    this._bboxDirty = true;
    this.dirtyClientBoundingRect();
    if (lodash.isString(this.attr.originX) || lodash.isString(this.attr.originY)) {
      this._transformDirty = true;
    }
  }

  private _mountClip() {
    const clip = this.getClipElement();
    if (clip && this.ownerRender) {
      clip.isClip = true;
      clip.ownerRender = this.ownerRender;
    }
  }

  private _computeGlobalTransform(): mat3 {
    const parentTransform: mat3 | null = this.parentNode
      ? this.parentNode.getGlobalTransform(true)
      : null;
    const selfTransform = this.getTransform(true);
    const [dx, dy] = this._dragOffset;
    if (!parentTransform && !selfTransform && dx === 0 && dy === 0) {
      return null;
    }
    const out = this._absTransform ? mat3.identity(this._absTransform) : mat3.createVec3();
    if (dx !== 0 || dy !== 0) {
      mat3.translate(out, out, this._dragOffset);
    }
    if (parentTransform) {
      mat3.multiply(out, out, parentTransform);
    }
    if (selfTransform) {
      mat3.multiply(out, out, selfTransform);
    }
    return out;
  }

  private _removeSVGAttribute(attr: string) {
    (this.ownerRender.getPainter() as SVGPainter).removeNodeAttribute(this as any, attr);
  }

  private _addToFrame() {
    if (this.ownerRender) {
      this._inFrameAble = true;
      this.ownerRender.__addFrameableElement(this);
    }
  }

  private _removeFromFrame() {
    this._inFrameAble = false;
    this.ownerRender?.__removeFrameableElement(this);
  }

  private _getOrigin(value: number | 'top' | 'left' | 'right' | 'center' | 'bottom', axis: 'x' | 'y') {
    if (typeof value === 'number') {
      return value;
    }
    const localBBox = this.getBBox();
    if (value === 'left') {
      return localBBox.x;
    }
    if (value === 'right') {
      return localBBox.x + localBBox.width;
    }
    if (value === 'top') {
      return localBBox.y;
    }
    if (value === 'bottom') {
      return localBBox.y + localBBox.height;
    }
    if (value === 'center') {
      if (axis === 'x') {
        return localBBox.x + localBBox.width / 2;
      }
      if (axis === 'y') {
        return localBBox.y + localBBox.height / 2;
      }
    }
  }

  private _getAnimationKeys(): Array<keyof T> {
    let animationKeys = animationKeysMap[this.type] as Array<keyof T>;
    if (!animationKeys) {
      animationKeys = this.getAnimationKeys();
      animationKeysMap[this.type] = animationKeys as Array<keyof ShapeAttr>;
    }
    return animationKeys;
  }

  private _runAnimation(now: number) {
    if (!this._animations.length) {
      return;
    }

    let animate = this._animations[0];
    let progress = 0;
    if (animate.startTime) {
      progress = Math.min((now - animate.startTime) / animate.during, 1);
    } else {
      animate.startTime = now;
    }
    progress =
      typeof animate.ease === 'function'
        ? animate.ease(progress)
        : parseEase(animate.ease)(progress);
    let fn: Function = interpolate;
    for (const key in animate.to) {
      if (key === 'color' || key === 'fill' || key === 'stroke' || key === 'shadowColor') {
        fn = interpolateColor;
      } else if (key === 'pathData') {
        fn = interpolatePath;
      } else {
        fn = interpolate;
      }
      this.setAttr(key, fn(animate.from[key], animate.to[key], progress));
    }
    if (progress === 1) {
      animate.callback && animate.callback();
      animate.stopped = true;
    }
    animate.onFrame && animate.onFrame(progress);
    progress >= 1 && this._animations.shift();
    animate = null;
  }

  private _applyTransition(tick: number) {
    if (!this._transitions.length) {
      return;
    }
    this._transitions.forEach(transition => {
      const { startTime, values, transitionProperty, transitionDuration, transitionTimingFunction, transitionDelay = 0 } = transition;
      let progress = 0;
      let fn: Function = interpolate;
      if (startTime) {
        progress = Math.min((tick - startTime) / transitionDuration, 1);
      } else {
        transition.startTime = tick;
      }
      progress = parseEase(transitionTimingFunction as EasingName)(progress);
      if (transitionProperty === 'color' || transitionProperty === 'fill' || transitionProperty === 'stroke' || transitionProperty === 'shadowColor') {
        fn = interpolateColor;
      } else if (transitionProperty === 'pathData') {
        fn = interpolatePath;
      } else {
        fn = interpolate;
      }
      this._setTransitionAttr(transitionProperty as keyof T, fn(values[0], values[1], progress));
      if (progress >= 1) {
        transition.finished = true;
        this._setTransitionAttr(transitionProperty as keyof T, undefined);
        this.dispatch('transitionend',new SyntheticTransitionEvent('transitionend', {
          elapsedTime: transitionDuration,
          propertyName: transitionProperty,
          bubbles: true,
        }));
      }
    });
    this._transitions = this._transitions.filter(transition => !transition.finished);
    if (this._transitions.length === 0) {
      this._transitionAttr = null;
    } 
  }

  private _setTransitionAttr(key: keyof T, value: any) {
    if (!this._transitionAttr) {
      this._transitionAttr = {} as T;
    }
    if (value === undefined) {
      delete this._transitionAttr[key];
      return;
    } else {
      this._transitionAttr[key] = value;
    }
    const oldValue = this.attr[key];
    this.attr[key] = value;
    this.onAttrChange(key, value, oldValue);
  }

  private _getStatusStyle(status: string): T {
    switch (status) {
      case 'active':
        return this.attr.activeStyle as T;
      case 'hover':
        return this.attr.hoverStyle as T;
      case 'focus':
        return this.attr.focusStyle as T;
      default:
        return this.attr.stateStyles?.[status]  as T;
    }
  }
}
