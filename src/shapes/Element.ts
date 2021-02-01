import Eventful from '../utils/Eventful';
import Render from '../render';
import CanvasPainter from '../painter/CanvasPainter';
import Group, { GroupConf } from './Group';
import * as lodash from '../utils/lodash';
import { ColorValue, } from '../color';
import AnimateAble, { AnimateConf, AnimateOption } from '../abstract/AnimateAble';
import easingFunctions, { EasingName } from '../animate/ease';
import { interpolate } from '../interpolate';
import interpolatePath from '../interpolate/interpolatePath';
import interpolateColor from '../interpolate/interpolateColor';
import TransformAble, { TransformConf } from '../abstract/TransformAble';
import { EventConf } from '../event';
import Shape, { ShapeConf } from './Shape';
import * as mat3 from '../../js/mat3';
import { Vec2, transformMat3, vec2BBox, createVec2 } from '../utils/vec2';
import * as transformUtils from '../utils/transform';
import { RGBA_TRANSPARENT, IDENTRY_MATRIX } from '../constant';
import { BBox, unionBBox, ceilBBox, createZeroBBox } from '../utils/bbox';
import { Ref } from '../utils/ref';
import { getSVGStyleAttributes } from '../svg/style';

export type ElementAttr = GroupConf & ShapeConf;

export const defaultSetting: { during: number; ease: EasingName } = {
  during: 300,
  ease: 'CubicOut',
};

// 对象重用
const reuseBBoxVectors: Vec2[] = [createVec2(), createVec2(), createVec2(), createVec2()];

export interface BaseAttr extends TransformConf, EventConf {
  key?: string;
  ref?: Ref<Element>;
  display?: boolean;
  // 已废弃属性
  zIndex?: number;

  fill?: ColorValue;
  stroke?: ColorValue;
  strokeNoScale?: boolean;
  lineWidth?: number;
  lineDash?: number[];
  lineDashOffset?: number;
  lineJoin?: CanvasLineJoin;
  lineCap?: CanvasLineCap;
  miterLimit?: number;

  opacity?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
  blendMode?:
    | 'source-over'
    | 'source-atop'
    | 'source-in'
    | 'source-out'
    | 'destination-over'
    | 'destination-atop'
    | 'destination-in'
    | 'destination-out'
    | 'lighter'
    | 'copy'
    | 'xor';

  clip?: Shape | Ref<Shape>;

  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  cursor?: string;
  pointerEvents?: 'none' | 'auto';
}

export interface CommonAttr<T extends BaseAttr = BaseAttr> extends BaseAttr {
  transitionProperty?: 'all' | 'none' | Array<keyof T>;
  transitionEase?: EasingName;
  transitionDuration?: number;
  transitionDelay?: number;
}

// 可继承(不可跨级)
export const defaultCanvasContext: ShapeConf = {
  fill: 'none',
  stroke: 'none',
  lineWidth: 1,
  lineDash: null,
  lineDashOffset: 0,
  lineJoin: 'bevel', // canvas默认miter
  lineCap: 'butt',
  miterLimit: 10,
  fillOpacity: 1,
  strokeOpacity: 1,
  blendMode: 'source-over',
  fontSize: 12, // 非canvas默认
  fontFamily: 'sans-serif',
  fontWeight: 'normal',
  fontStyle: 'normal',
  fontVariant: 'normal',
  textAlign: 'start',
  textBaseline: 'bottom', // canvas默认值'alphabetic',
  shadowColor: RGBA_TRANSPARENT,
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  cursor: 'auto',
  pointerEvents: 'auto',
};
const extendAbleKeys = Object.keys(defaultCanvasContext);

const transformKeys: Array<keyof CommonAttr> = [
  'rotation',
  'scaleX',
  'scaleY',
  'translateX',
  'translateY',
  'originX',
  'originY',
];

const animationKeysMap: Record<string, Array<keyof ShapeConf>> = {};

const defaultTRansformConf: CommonAttr = {
  originX: 0,
  originY: 0,
  translateX: 0,
  translateY: 0,
  scaleX: 0,
  scaleY: 0,
  origin: [0, 0],
  position: [0, 0],
  scale: [0, 0],
};

let nodeId = 1;
export default class Element<T extends CommonAttr = ElementAttr>
  extends Eventful
  implements AnimateAble<T>, TransformAble {
  public id: number;

  public attr: T & CommonAttr = {} as T;

  public type: string;

  public svgTagName: string = 'path';

  public parentNode: Group | null;

  public firstChild: Element;

  public lastChild: Element;

  public prevSibling: Element;

  public nextSibling: Element;

  public ownerRender: Render | null;

  public pickByGPU: boolean = true;

  public pickRGB: [number, number, number];

  public readonly shapeKeys: Array<keyof T> = [];

  public fillAble: boolean = true;

  public strokeAble: boolean = true;

  private _dirty: boolean = true;

  private _animations: AnimateOption<T>[] = [];

  private _bbox: BBox;

  private _bboxDirty: boolean = true;

  private _transform: mat3 = IDENTRY_MATRIX;

  private _absTransform: mat3;

  private _transformDirty: boolean = false;

  private _absTransformDirty: boolean = true; // 自身或祖先矩阵变化

  private _baseMatrix: mat3 = IDENTRY_MATRIX;

  private _clientBoundingRect: BBox;

  private _clientBoundingRectDirty: boolean = true;

  private _dirtyRect: BBox;

  private _lastFrameTime: number;

  public constructor(attr?: T) {
    super();
    this.id = nodeId++;
    this.attr = this.getDefaultAttr();
    attr && this.setAttr(attr);
    this.created();
  }

  public getAnimationKeys(): Array<keyof T> {
    return [
      'fill',
      'stroke',
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
      'shadowColor',
      'shadowBlur',
      'shadowOffsetX',
      'shadowOffsetY',
    ] as Array<keyof CommonAttr>;
  }

  public getDefaultAttr(): T {
    return {
      display: true,
      draggable: false,
      opacity: 1,
      rotation: 0,
      strokeNoScale: false,
    } as T;
  }

  protected onEvent = (type: string, ...params: any[]) => {
    const eventKey = Object.keys(this.attr).filter(
      key => key.toLowerCase() === 'on' + type,
    )[0] as keyof EventConf;
    if (eventKey) {
      (this.attr[eventKey] as Function).apply(null, params);
    }
  }

  public getComputedOpacity(): number {
    let node: Element<any> = this;
    let opacity = 1;
    // 透明度有继承叠加效果
    while (node) {
      opacity *= node.attr.opacity;
      node = node.parentNode;
    }
    return opacity;
  }

  public getExtendAttr<U extends keyof T>(key: U): T[U] {
    let value: T[U] = (defaultCanvasContext as T)[key];
    // 透明度有继承叠加效果
    let node: Element<any> = this;
    while (node) {
      if (typeof node.attr[key] !== 'undefined') {
        value = node.attr[key];
        break;
      }
      node = node.parentNode;
    }
    if (key !== 'lineWidth' || !this.attr.strokeNoScale) {
      return value;
    }
    const globalTransform = this.getGlobalTransform();
    const scale = globalTransform[0];
    return (((value as any) as number) / scale) as any;
  }

  public hasFill(): boolean {
    const fill = this.getExtendAttr('fill');
    return fill && fill !== 'none';
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

  public setAttr<U extends keyof T | T>(
    attr: U,
    value?: U extends keyof T ? T[U] : undefined,
  ): this {
    if (!attr) {
      return this;
    }
    if (typeof attr === 'string') {
      if (this.attr[attr as keyof T] === value) {
        return;
      }
      this.dirty();
      const oldValue = this.attr[attr as keyof T];
      this.attr[attr as keyof T] = value;
      this.onAttrChange(attr as keyof T, value, oldValue);
    } else if (typeof attr === 'object') {
      this.prevProcessAttr(attr as T);
      this.dirty();
      const prevAttr = this.attr;
      this.attr = { ...this.attr, ...(attr as T) };
      for (const key in attr as T) {
        if (this.attr[key as keyof T] !== (prevAttr as T)[key]) {
          this.onAttrChange(key as keyof T, (attr as T)[key], prevAttr[key as keyof T]);
        }
      }
    }

    return this;
  }

  public get isClip(): boolean {
    return this.ownerRender && !this.parentNode;
  }

  public get isGroup(): boolean {
    return this.type === 'group';
  }

  public beforeDirty(leafNodeSize: number) {
    const maxDirtyLimit = this.ownerRender.maxDirtyRects;
    if (this.ownerRender.getDirtyElements().size > maxDirtyLimit || leafNodeSize > maxDirtyLimit) {
      this._dirtyRect = undefined;
      return;
    }
    if (!this._dirty && this._clientBoundingRect) {
      this._dirtyRect = this.getCurrentDirtyRect();
    }
  }

  public isDirty(): boolean {
    return this._dirty;
  }

  public dirty(dirtyElement: Element = null) {
    let leafNodeSize = 1;
    if (this.ownerRender && this.ownerRender.renderer === 'canvas') {
      if (this.isGroup) {
        leafNodeSize = (this as  any as Group).getLeafNodesSize();
        this.beforeDirty(leafNodeSize)
      } else {
        this.beforeDirty(leafNodeSize);
      }
    }
    this._dirty = true;
    if (this.ownerRender) {
      this.ownerRender.dirty(dirtyElement || this);
      if (this.isGroup && this.ownerRender.renderer === 'canvas') {
        if (leafNodeSize > this.ownerRender.maxDirtyRects) {
          (this.ownerRender.getPainter() as CanvasPainter).noDirtyRectNextFrame();
        }
      }
    }
    if (this.attr.clip) {
      this._mountClip();
    }
    if (this.attr.ref) {
      this.attr.ref.current = this as Element<any>;
    }
  }

  public clearDirty() {
    this._dirty = false;
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

  public getBBox(): BBox {
    if (!this._bbox || this._bboxDirty) {
      this._bbox = this.computeBBox();
      this._bboxDirty = false;
    }
    return this._bbox;
  }

  // todo 计算boundRect同时计算dirtyRect
  public getClientBoundingRect(): BBox {
    if (this.attr.display === false) {
      return createZeroBBox();
    }
    if (!this._clientBoundingRect || this._clientBoundingRectDirty) {
      this._clientBoundingRect = this.computClientBoundingRect(
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
    const shadowBlur = this.getExtendAttr('shadowBlur');
    if (shadowBlur === 0) {
      return ceilBBox(this.getClientBoundingRect());
    }
    // 计算当前dirtyRect
    const { x, y, width, height } = this.getClientBoundingRect();
    // 暂不考虑miter尖角影响, 默认使用了bevel
    // const miterLimit = this.getExtendAttr('miterLimit');
    // const lineJoin = this.getExtendAttr('lineJoin');
    if (shadowBlur === 0) {
      return ceilBBox({ x, y, width, height });
    }
    const shadowOffsetX = this.getExtendAttr('shadowOffsetX');
    const shadowOffsetY = this.getExtendAttr('shadowOffsetY');
    const shadowBBox = {
      x: x + shadowOffsetX - shadowBlur,
      y: y + shadowOffsetY - shadowBlur,
      width: width + shadowBlur + shadowOffsetX,
      height: height + shadowBlur + shadowOffsetY,
    };
    return ceilBBox(unionBBox([this._clientBoundingRect, shadowBBox]));
  }

  protected computeBBox(): BBox {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  public getSvgAttributes(): any {
    return getSVGStyleAttributes(this as any);
  }

  protected computClientBoundingRect(out: BBox): BBox {
    // todo gc optimize
    let { x, y, width, height } = this.getBBox();
    const hasStroke = this.hasStroke();
    const lineWidth = hasStroke && !this.isGroup ? this.getExtendAttr('lineWidth') : 0;
    const offsetLineWidth = (Math.sqrt(2) / 2) * lineWidth;
    x -= offsetLineWidth;
    y -= offsetLineWidth;
    width += offsetLineWidth * 2;
    height += offsetLineWidth * 2;
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
    const matrix = this.getGlobalTransform();
    reuseBBoxVectors.forEach(vec2 => transformMat3(vec2, vec2, matrix));
    return vec2BBox(reuseBBoxVectors, out);
  }

  public created() {
    // do nothing
  }

  protected onAttrChange<U extends keyof T>(key: U, newValue: T[U], oldValue: T[U]) {
    if (newValue === oldValue) {
      return;
    }
    if (transformKeys.indexOf(key as keyof CommonAttr) !== -1) {
      this.dirtyTransform();
    }
    if (key === 'display') {
      this.dirtyBBox();
    }
    if (this.shapeKeys.indexOf(key) !== -1) {
      this.dirtyBBox();
    }
    if (key === 'clip' && this.attr.clip) {
      const clip = this.getClipElement();
      if (!clip.parentNode) {
        clip.destroy();
      }
    }
  }

  public mounted() {
    if (this.parentNode) {
      this.ownerRender = this.parentNode.ownerRender;
    }
    if (this.ownerRender && this.attr.onMounted) {
      this.attr.onMounted();
    }
    this._mountClip();
  }

  public resetPickRGB() {
    this.pickRGB = null;
  }

  /**
   *
   * @param x inverted x
   * @param y inverted y
   */
  public isInShape(x: number, y: number): boolean {
    const hasFill = this.hasFill();
    const hasStroke = this.hasStroke();
    const lineWidth = this.getExtendAttr('lineWidth');
    return (
      (hasFill && this.isPointInFill(x, y)) || (hasStroke && this.isPointInStroke(x, y, lineWidth))
    );
  }

  public isInClip(x: number, y: number): boolean {
    const clips = this.getClipList();
    return clips.every(clip => clip.isPointInFill(x, y));
  }

  public dirtyClipTarget(clip: Element) {
    const myclip = this.getClipElement();
    if (myclip && myclip === clip) {
      this.dirty();
    }
  }

  public getClipList(): Element[] {
    const clips: Element[] = [];
    let node: any = this;
    while (node) {
      const clip = node.getClipElement();
      clip && clips.push(clip);
      node = node.parentNode;
    }
    return clips;
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
    this.parentNode = null;
    this.ownerRender = null;
    this.prevSibling = this.nextSibling = this.firstChild = this.lastChild = null;
    this._transformDirty = true;
    this._absTransformDirty = true;
    this._clientBoundingRectDirty = true;
    this._bboxDirty = true;
    const clip = this.getClipElement();
    if (clip && !clip.parentNode) {
      clip.destroy();
    }
    this.stopAllAnimation();
    this.removeAllListeners();
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
    let animationKeys = animationKeysMap[this.type] as Array<keyof T>;
    if (!animationKeys) {
      animationKeys = this.getAnimationKeys();
      animationKeysMap[this.type] = animationKeys as Array<keyof ShapeConf>;
    }
    animationKeys = animationKeys.filter(key => {
      const toValue = toAttr[key];
      const fromValue = fromAttr[key];
      return !(lodash.isNull(toValue) || lodash.isUndefined(toValue)) && fromValue !== toValue;
    });

    const nonAnimateAttr = lodash.omit(toAttr, animationKeys) as T;
    const animateToAttr = lodash.pick(toAttr, animationKeys);
    const animateFromAttr = lodash.pick({ ...defaultTRansformConf, ...fromAttr }, animationKeys);
    animationKeys.forEach(key => {
      if (animateFromAttr[key] === undefined) {
        animateFromAttr[key] = this.getExtendAttr(key);
      }
    });
    this.setAttr(nonAnimateAttr);
    if (typeof duringOrConf === 'object') {
      this.addAnimation({
        stopped: false,
        from: animateFromAttr as T,
        to: animateToAttr,
        during: duringOrConf.during,
        ease,
        delay,
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
  }

  public stopAllAnimation(gotoEnd: boolean = false): this {
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

    this._lastFrameTime = now;

    if (this.attr.clip) {
      const clipElement = this.getClipElement();
      clipElement && clipElement.onFrame(now);
    }

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
        : easingFunctions[animate.ease || 'Linear'](progress);
    let fn: Function = interpolate;
    for (const key in animate.to) {
      if (key === 'fill' || key === 'stroke' || key === 'shadowColor') {
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

  public getTransform(): mat3 {
    if (!this._transform || this._transformDirty) {
      this._transform = this._computeTransform();
      this._transformDirty = false;
    }
    return this._transform;
  }

  public getBaseTransform(): mat3 {
    return this._baseMatrix;
  }

  public getGlobalTransform(): mat3 {
    if (!this._absTransform || this._absTransformDirty) {
      this._absTransform = this._computeGlobalTransform();
      this._absTransformDirty = false;
    }
    return this._absTransform;
  }

  public resetTransform() {
    this.dirty();
    this._baseMatrix = mat3.create();
    this.dirtyAbsTransform();
  }

  public setBaseTransform(matrix: mat3) {
    this.dirty();
    this._baseMatrix = matrix;
    this.dirtyAbsTransform();
  }

  public translate(dx: number, dy: number) {
    this.dirty();
    this._baseMatrix = mat3.translate(mat3.create(), this._baseMatrix, [dx, dy]);
    this.dirtyAbsTransform();
  }

  public scale(sx: number, sy: number = sx) {
    this.dirty();
    this._baseMatrix = mat3.scale(mat3.create(), this._baseMatrix, [sx, sy]);
    this.dirtyAbsTransform();
  }

  public rotate(rad: number) {
    this.dirty();
    this._baseMatrix = mat3.rotate(mat3.create(), this._baseMatrix, rad);
    this.dirtyAbsTransform();
  }

  public dirtyClientBoundingRect() {
    this._clientBoundingRectDirty = true;
    this.parentNode?.dirtyBBox();
  }

  private _computeTransform(): mat3 {
    const out = this._transform === IDENTRY_MATRIX ? mat3.create() : mat3.identity(this._transform);
    const {
      rotation = 0,
      originX = 0,
      originY = 0,
      scaleX = 1,
      scaleY = 1,
      translateX = 0,
      translateY = 0,
    } = this.attr;
    (translateX !== 0 || translateY !== 0) && mat3.translate(out, out, [translateX, translateY]);
    rotation !== 0 && transformUtils.rotate(out, rotation, originX, originY);
    (scaleX !== 1 || scaleY !== 1) && transformUtils.scale(out, scaleX, scaleY, originX, originY);
    return out;
  }

  public dirtyTransform() {
    this._transformDirty = true;
    this.dirtyAbsTransform();
  }

  public dirtyAbsTransform() {
    this._absTransformDirty = true;
    this.dirtyClientBoundingRect();
    if (this.ownerRender && this.ownerRender.renderer === 'svg') {
      this.ownerRender.dirty(this);
    }
  }

  public dirtyBBox() {
    this._bboxDirty = true;
    this.dirtyClientBoundingRect();
  }

  private _mountClip() {
    const clip = this.getClipElement();
    if (clip) {
      clip.ownerRender = this.ownerRender;
    }
  }

  private _computeGlobalTransform(): mat3 {
    const parentTransform = this.parentNode ? this.parentNode.getGlobalTransform() : IDENTRY_MATRIX;
    const selfTransform = this.getTransform();
    const out = this._absTransform ? mat3.identity(this._absTransform) : mat3.create();
    mat3.multiply(out, this._baseMatrix, parentTransform);
    return mat3.multiply(out, out, selfTransform);
  }
}
