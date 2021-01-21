import Eventful from '../utils/Eventful';
import Render from '../render';
import Group, { GroupConf } from './Group';
import * as lodash from '../utils/lodash';
import { ColorValue, isTransparent } from '../color';
import AnimateAble, { AnimateConf, AnimateOption } from '../abstract/AnimateAble';
import easingFunctions, { EasingName } from '../animate/ease';
import interpolateAttr from '../interpolate/interpolateAttr';
import TransformAble, { TransformConf } from '../abstract/TransformAble';
import { EventConf } from '../event';
import Shape, { ShapeConf } from './Shape';
import * as mat3 from '../../js/mat3';
import { Vec2, transformMat3 } from '../utils/vec2';
import * as transformUtils from '../utils/transform';
import { RGBA_TRANSPARENT, IDENTRY_MATRIX } from '../constant';
import { BBox, unionBBox, ceilBBox } from '../utils/bbox';

export type Ref<T extends Element = Element> = { current?: T };

export type ElementAttr = GroupConf & ShapeConf;

export interface BaseAttr extends TransformConf, EventConf {
  key?: string;
  ref?: Ref;
  display?: boolean;
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

export interface FillAndStrokeStyle {
  fill: ColorValue;
  stroke: ColorValue;
  lineWidth: number;
  hasFill: boolean;
  hasStroke: boolean;
  needFill: boolean;
  needStroke: boolean;
  opacity: number;
  fillOpacity: number;
  strokeOpacity: number;
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

const transformKeys: Array<keyof CommonAttr> = ['origin', 'position', 'rotation', 'scale'];

const animationKeysMap: Record<string, Array<keyof ShapeConf>> = {};

const defaultTRansformConf: CommonAttr = {
  origin: [0, 0],
  position: [0, 0],
  scale: [0, 0],
};

const styleReceiver: Partial<FillAndStrokeStyle> = Object.create(null);

export default class Element<T extends CommonAttr = ElementAttr>
  extends Eventful
  implements AnimateAble<T>, TransformAble {
  public attr: T & CommonAttr = {} as T;

  public type: string;

  public parentNode: Group | undefined;

  public firstChild: Element;

  public lastChild: Element;

  public prevSibling: Element;

  public nextSibling: Element;

  public ownerRender: Render | undefined;

  public pickByGPU: boolean = true;

  public pickRGB: [number, number, number];

  public readonly shapeKeys: Array<keyof T> = [];

  public fillAble: boolean = true;

  public strokeAble: boolean = true;

  private _dirty: boolean = true;

  private _animations: AnimateOption<T>[] = [];

  private _bbox: BBox = { x: 0, y: 0, width: 0, height: 0 };

  private _bboxDirty: boolean = true;

  private _transform: mat3 = IDENTRY_MATRIX;

  private _absTransform: mat3;

  private _transformDirty: boolean = false;

  private _absTransformDirty: boolean = false; // 自身或祖先矩阵变化

  private _baseMatrix: mat3 = IDENTRY_MATRIX;

  private _clientBoundingRect: BBox;

  private _clientBoundingRectDirty: boolean = true;

  private _dirtyRect: BBox;

  private _lastFrameTime: number;

  public constructor(attr: T = {} as T) {
    super();
    this.attr = this.getDefaultAttr();
    this.setAttr(attr);
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
      'position',
      'scale',
      'origin',
      'shadowColor',
      'shadowBlur',
      'shadowOffsetX',
      'shadowOffsetY',
    ] as Array<keyof CommonAttr>;
  }

  public getDefaultAttr(): T {
    return {
      display: true,
      zIndex: 0,
      draggable: false,
      opacity: 1,
      rotation: 0,
      strokeNoScale: false,
    } as T;
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
    if (key === 'lineWidth' && this.attr.strokeNoScale) {
      const globalTransform = this.getGlobalTransform();
      const scale = globalTransform[0];
      return (((value as any) as number) / scale) as any;
    }
    node = null;
    return value;
  }

  public hasFill(): boolean {
    const fill = this.getExtendAttr('fill');
    return fill && fill !== 'none';
  }

  public hasStroke() {
    const stroke = this.getExtendAttr('stroke');
    return stroke && stroke !== 'none';
  }

  public getFillAndStrokeStyle(): FillAndStrokeStyle {
    const opacity = this.getComputedOpacity();
    const fillOpacity = this.getExtendAttr('fillOpacity') * opacity;
    const strokeOpacity = this.getExtendAttr('strokeOpacity') * opacity;
    const lineWidth = this.getExtendAttr('lineWidth');
    const stroke = this.getExtendAttr('stroke');
    const fill = this.getExtendAttr('fill');
    const hasFill = fill && fill !== 'none';
    const hasStroke = stroke && stroke !== 'none' && lineWidth > 0;
    const receiver = styleReceiver;
    receiver.fill = fill;
    receiver.stroke = stroke;
    receiver.opacity = opacity;
    receiver.fillOpacity = fillOpacity;
    receiver.strokeOpacity = strokeOpacity;
    receiver.lineWidth = lineWidth;
    receiver.hasFill = hasFill;
    receiver.hasStroke = hasFill;
    receiver.needFill = hasFill && fillOpacity !== 0 && !isTransparent(fill);
    receiver.needStroke = hasStroke && strokeOpacity !== 0 && !isTransparent(stroke);
    return receiver as FillAndStrokeStyle;
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

  public setAttr(attr: T & CommonAttr = {} as T): this {
    const keys = Object.keys(attr) as Array<keyof T>;
    if (keys.every(key => attr[key] === this.attr[key])) {
      return;
    }
    this.prevProcessAttr(attr);
    const prevAttr = this.attr;
    this.dirty();
    this.attr = { ...this.attr, ...attr };
    this.updated(prevAttr, attr);
    return this;
  }

  public get isGroup(): boolean {
    return this.type === 'group';
  }

  public beforeDirty() {
    if (!this._dirty && this._clientBoundingRect) {
      this._dirtyRect = this.getCurrentDirtyRect();
    }
  }

  public isDirty(): boolean {
    return this._dirty;
  }

  public dirty(dirtyElement: Element = null) {
    this.beforeDirty();
    this._dirty = true;
    if (this.ownerRender) {
      this.ownerRender.dirty(dirtyElement || this);
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
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    if (!this._clientBoundingRect || this._clientBoundingRectDirty) {
      this._clientBoundingRect = this.computClientBoundingRect();
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
    // 计算当前dirtyRect
    const { x, y, width, height } = this.getClientBoundingRect();
    // 暂不考虑miter尖角影响, 默认使用了bevel
    // const miterLimit = this.getExtendAttr('miterLimit');
    // const lineJoin = this.getExtendAttr('lineJoin');
    const shadowBlur = this.getExtendAttr('shadowBlur');
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

  protected computClientBoundingRect(): BBox {
    let { x, y, width, height } = this.getBBox();
    const hasStroke = this.hasStroke();
    const lineWidth = hasStroke && !this.isGroup ? this.getExtendAttr('lineWidth') : 0;
    const offsetLineWidth = (Math.sqrt(2) / 2) * lineWidth;
    x -= offsetLineWidth;
    y -= offsetLineWidth;
    width += offsetLineWidth * 2;
    height += offsetLineWidth * 2;
    const vectors: Vec2[] = [
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
    ];
    const matrix = this.getGlobalTransform();

    vectors.forEach(vec2 => transformMat3(vec2, vec2, matrix));
    const xCoords = vectors.map(vec2 => vec2[0]);
    const yCoords = vectors.map(vec2 => vec2[1]);
    const minX = lodash.min(xCoords);
    const maxX = lodash.max(xCoords);
    const minY = lodash.min(yCoords);
    const maxY = lodash.max(yCoords);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  public created() {
    // do nothing
  }

  public updated(prevAttr: T, nextAttr: T) {

    for (let i = 0; i < transformKeys.length; i++) {
      if (nextAttr[transformKeys[i]] !== undefined) {
        this.dirtyTransform();
        break;
      }
    }

    for (let i = 0; i < this.shapeKeys.length; i++) {
      const key = this.shapeKeys[i];
      if (nextAttr[key] !== undefined && nextAttr[key] !== prevAttr[key]) {
        this.dirtyBBox();
        break;
      }
    }

    if (nextAttr.display !== undefined && nextAttr.display !== prevAttr.display) {
      this.dirtyBBox();
    }

    if (nextAttr.zIndex !== undefined) {
      this.parentNode.dirtyZIndex();
    }
  }

  public mounted() {
    if (this.parentNode) {
      this.ownerRender = this.parentNode.ownerRender;
    }
    if (this.attr.zIndex > 0) {
      this.parentNode.dirtyZIndex();
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
    this._transformDirty = true;
    this._absTransformDirty = true;
    this._clientBoundingRectDirty = true;
    this._bboxDirty = true;
    this.stopAllAnimation();
    this.removeAllListeners();
  }

  /* ************ AnimateAble Begin ******************* */

  public animateTo(
    toAttr: T,
    duringOrConf: number | AnimateConf = 400,
    ease?: EasingName,
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
    // attr;
  }

  public addAnimation(option: AnimateOption<T>) {
    this._animations.push(option);
  }

  public stopAllAnimation(gotoEnd: boolean = false) {
    // todo goToEnd
    this._animations = [];
    return this;
  }

  public onFrame(now: number) {
    // clip element maybe usesed for muti component

    if (this._lastFrameTime === now) {
      return;
    }
    this._lastFrameTime = now;
    const clipElement = this.getClipElement();
    clipElement && clipElement.onFrame(now);

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
    const attr = interpolateAttr(animate.from, animate.to, progress) as T;
    if (progress === 1) {
      animate.callback && animate.callback();
      animate.stopped = true;
    }
    this.setAttr(attr);
    animate.onFrame && animate.onFrame(progress);
    this._animations = this._animations.filter(item => !item.stopped);
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
    const out = mat3.create();
    let { rotation = 0, origin = [0, 0], position = [0, 0], scale = [1, 1] } = this.attr;
    const [sx, sy] = scale;
    (position[0] !== 0 || position[1] !== 0) && mat3.translate(out, out, position);
    rotation !== 0 && transformUtils.rotate(out, rotation, origin[0], origin[1]);
    (sx !== 1 || sy !== 1) && transformUtils.scale(out, sx, sy, origin[0], origin[1]);
    rotation = origin = position = scale = null;
    return out;
  }

  public dirtyTransform() {
    this._transformDirty = true;
    this.dirtyAbsTransform();
  }

  public dirtyAbsTransform() {
    this._absTransformDirty = true;
    this.dirtyClientBoundingRect();
  }

  protected dirtyBBox() {
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
    const out = mat3.create();
    mat3.multiply(out, this._baseMatrix, parentTransform);
    return mat3.multiply(out, out, selfTransform);
  }
}
