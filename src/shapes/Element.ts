import Eventful from '../utils/Eventful';
import Render from '../render';
import Group, {GroupConf, } from './Group';
import * as lodash from '../utils/lodash';
import { ColorValue, isTransparent, } from '../color';
import AnimateAble, { AnimateConf, AnimateOption } from '../abstract/AnimateAble';
import SyntheticDragEvent from '../event/SyntheticDragEvent';
import DragAndDrop, {DragAndDropConf, } from '../abstract/DragAndDrop';
import { EasingName } from '../animate/ease';
import interpolateAttr from '../interpolate/interpolateAttr';
import TransformAble, { TransformConf } from '../abstract/TransformAble';
import { EventConf } from '../event';
import Shape, {ShapeConf, } from './Shape';
import * as mat3 from '../../js/mat3'
import {Vec2, transformMat3, } from '../utils/vec2';
import * as transformUtils from '../utils/transform';
import {RGBA_TRANSPARENT, } from '../constant';

export type Ref<T extends Element=Element> = {current?: T};

export type ElementAttr = GroupConf & ShapeConf;

export interface BaseAttr extends TransformConf, EventConf, DragAndDropConf {
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
  blendMode?: 'source-over' | 'source-atop' | 'source-in' | 'source-out' | 'destination-over' | 'destination-atop' | 'destination-in' | 'destination-out' | 'lighter' | 'copy' | 'xor';

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

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FillAndStrokeStyle {
  fill: ColorValue, 
  stroke: ColorValue, 
  lineWidth: number, 
  hasFill: boolean; 
  hasStroke: boolean;
  needFill: boolean;
  needStroke: boolean;
  opacity: number;
  fillOpacity: number;
  strokeOpacity: number;
}

const identityTrasnform = mat3.create();
// 可继承(不可跨级)
export const defaultCanvasContext: ShapeConf = {
  fill: 'none',
  stroke: 'none',
  lineWidth: 1,
  lineDash: null,
  lineDashOffset: 0,
  lineJoin: 'miter',
  lineCap: 'butt',
  miterLimit: 10,
  fillOpacity: 1,
  strokeOpacity: 1,
  blendMode: 'source-over',
  fontSize: 12, // 非canvas默认
  fontFamily: 'sans-serif',
  textAlign: 'start',
  textBaseline: 'bottom', // canvas默认值'alphabetic',
  shadowColor: RGBA_TRANSPARENT,
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  cursor: 'auto',

}
const extendAbleKeys = lodash.keys(defaultCanvasContext);

const animationKeysMap: Record<string, Array<keyof ShapeConf>> = {};

const defaultTransformConf: CommonAttr = {
  position: [0, 0],
  rotation: 0,
  scale: [1, 1],
  origin: [0, 0],
}

export default class Element<T extends CommonAttr = ElementAttr>
  extends Eventful
  implements AnimateAble<T>, TransformAble, DragAndDrop {
  public attr: T & CommonAttr = {} as T ;

  public type: string;
  
  public pickRGB: [number, number, number];

  public readonly shapeKeys: Array<keyof T> = [];

  public fillAble: boolean = true;

  public strokeAble: boolean = true;

  public ownerRender: Render | undefined;

  public parentNode: Group | undefined;

  private _animations: AnimateOption<T>[] = [];

  private _bbox: BBox = { x: 0, y: 0, width: 0, height: 0 };

  private _bboxDirty: boolean = true;

  private _transform: mat3 = identityTrasnform;

  private _absTransform: mat3;

  private _transformDirty: boolean = false;

  private _absTransformDirty: boolean = false; // 自身或祖先矩阵变化

  private _baseMatrix: mat3 = mat3.create();

  private _clientBoundingRect: BBox;

  private _clientBoundingRectDirty: boolean = true;

  private _lastFrameTime: number;
  

  public constructor(attr: T = {} as T) {
    super();
    const initAttr = { ...this.getDefaultAttr(), ...attr };
    this.setAttr(initAttr);
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
      strokeNoScale: false,
      pointerEvents: 'auto',
    } as T;
  }

  public getComputedOpacity(): number {
    let node: Element<any> = this;
    let opacity = 1;
    // 透明度有继承叠加效果
    while(node) {
      opacity *= node.attr.opacity;
      node = node.parentNode;
    }
    return opacity;
  }

  public getExtendAttr<U extends keyof T>(key: U): T[U] {
    let value: T[U] = (defaultCanvasContext as T)[key];
    // 透明度有继承叠加效果
    let node: Element<any> = this;
    while(node) {
      if (typeof node.attr[key] !== 'undefined') {
        value = node.attr[key];
        break;
      }
      node = node.parentNode;
    }
    return value;
  }

  public hasFill(): boolean {
    const fill = this.getExtendAttr('fill')
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
    const {fill, stroke, lineWidth,} =  {
      fill: 'none',
      stroke: 'none',
      lineWidth: 0,
      ...this.parentNode?.attr,
      ...this.attr,
    };
    const hasFill = fill !== 'none' && fill !== null;
    const hasStroke = stroke !== 'none' && fill !== null && lineWidth > 0;
    return {
      fill,
      stroke,
      opacity,
      fillOpacity,
      strokeOpacity,
      lineWidth,
      hasFill,
      hasStroke,
      needFill: hasFill &&  fillOpacity !== 0 && !isTransparent(fill),
      needStroke: hasStroke && strokeOpacity !== 0 && !isTransparent(stroke),
    }
  }

  public getComputedAttr(): T {
    return {
      ...defaultCanvasContext,
      ...this.parentNode ? lodash.pick(this.parentNode.attr, extendAbleKeys) : null,
      ...defaultTransformConf,
      ...this.attr,
    }
  }

  public setAttr(attr: T & CommonAttr= {} as T): this {
    if (lodash.keys(attr).length === 0) {
      return;
    }
    const prevAttr = this.attr;
    this.attr = { ...this.attr, ...attr };
    this.dirty();
    this.updated(prevAttr, attr);
    return this;
  }

  public  get isGroup(): boolean {
    return this.type === 'group';
  }

  public dirty() {
    if (this.ownerRender) {
      this.ownerRender.dirty();
    }
    this._mountClip();
    if (this.attr.ref) {
      this.attr.ref.current = this as Element<any>;
    }
  }

  public getBBox(): BBox {
    if (!this._bbox || this._bboxDirty) {
      this._bbox = this.computeBBox();
      this._bboxDirty = false;
    }
    return this._bbox;
  }
  
  public getClientBoundingRect(): BBox {
    if (this.attr.display === false) {
      return {x: 0, y: 0, width: 0, height: 0};
    }
    if (!this._clientBoundingRect || this._clientBoundingRectDirty) {
      this._clientBoundingRect = this.computClientBoundingRect();
      this._clientBoundingRectDirty = false;
    }
    let {x, y, width, height}  =  this._clientBoundingRect;
    const lineWidth = !this.isGroup ? this.getExtendAttr('lineWidth') : 0
    x -= lineWidth / 2;
    y -= lineWidth / 2;
    width += lineWidth;
    height += lineWidth;
    return {
      x,
      y,
      width,
      height,
    }
  }

  protected computeBBox(): BBox {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  protected computClientBoundingRect(): BBox {
    const {x, y, width, height, } = this.getBBox();
    const vectors: Vec2[] = [
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
    ];
    const matrix = this.getAbsTransform();
    vectors.forEach(vec2 => transformMat3(vec2, vec2, matrix));
    const xCoords =  vectors.map(vec2 => vec2[0]);
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
    }
  }

  public created() {
    // do nothing
  }

  public updated(prevAttr: T, nextAttr: T) {
    const transformKeys: Array<keyof CommonAttr> = ['origin', 'position', 'rotation', 'scale'].filter(
      key => !lodash.isUndefined((nextAttr as any)[key]),
    ) as any;
    const shapeKeys = ['display' as keyof T, ...this.shapeKeys.filter(key => !lodash.isUndefined(nextAttr[key]))];

    if (transformKeys.length) {
      // todo 精确判断数组变化
      this.dirtyTransform();
    }

    if (shapeKeys.some(key => prevAttr[key] !== nextAttr[key])) {
      this.dirtyBBox();
    }
  }

  public mounted() {
    if (this.parentNode) {
      this.ownerRender = this.parentNode.ownerRender;
    }
    this._mountClip();
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
    const fromAttr = this.attr;
    let animationKeys = animationKeysMap[this.type] as Array<keyof T>;
    if (!animationKeys) {
      animationKeys = this.getAnimationKeys();
      animationKeysMap[this.type] = animationKeys as Array<keyof ShapeConf>;
    }
    animationKeys = animationKeys.filter(key => {
      const value = toAttr[key];
      const fromValue = fromAttr[key];
      return !(lodash.isNull(value) || lodash.isUndefined(value)) && fromValue !== value;
    });
    const nonAnimateAttr = lodash.omit(toAttr, animationKeys) as T;
    const animateToAttr = lodash.pick(toAttr, animationKeys);
    const animateFromAttr = lodash.pick(fromAttr, animationKeys);
    this.setAttr(nonAnimateAttr);
    if (typeof duringOrConf === 'object') {
      this.addAnimation({
        stopped: false,
        from: animateFromAttr,
        to: animateToAttr,
        during: duringOrConf.during,
        ease,
        delay,
        ...duringOrConf,
      });
    } else {
      this.addAnimation({
        from: animateFromAttr,
        to: animateToAttr,
        during: duringOrConf,
        ease,
        callback,
        delay,
        stopped: false,
      });
    }
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

    const animate = this._animations[0];
    const { startTime, during, from, to, ease, callback, onFrame, delay } = animate;
    let progress = 0;
    if (startTime) {
      progress = Math.min((now - startTime) / during, 1);
    } else {
      animate.startTime = now;
    }
    const attr = interpolateAttr(from, to, progress) as T;
    if (progress === 1) {
      callback && callback();
      animate.stopped = true;
    }
    this.setAttr(attr);
    onFrame && onFrame(progress);
    this._animations = this._animations.filter(item => !item.stopped);
  }

  public getClipElement(): Shape {
    const {clip, } = this.attr;
    if (!clip) {
      return;
    }
    if (clip instanceof Element) {
      return clip;
    } 
    if (clip.current instanceof  Element) {
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

  private getAbsTransform(): mat3 {
    if (!this._absTransform || this._absTransformDirty) {
      this._absTransform = this._computeAbsTransform();
      this._absTransformDirty = false;
    }
    return this._absTransform;
  }

  public resetTransform() {
    this._baseMatrix = mat3.create();
    this.dirty();
    this.dirtyTransform();
  }

  public setBaseTransform(matrix: mat3) {
    this._baseMatrix = matrix;
  }

  public translate(dx: number, dy: number) {
    this._baseMatrix = mat3.translate(this._baseMatrix, this._baseMatrix, [dx, dy]);
    this.dirty();
    this.dirtyTransform();
  }

  public scale(sx: number, sy: number = sx) {
    this._baseMatrix = mat3.scale(this._baseMatrix, this._baseMatrix, [sx, sy]);
    this.dirty();
    this.dirtyTransform();
  }

  public rotate(rad: number) {
    this._baseMatrix = mat3.rotate(this._baseMatrix, this._baseMatrix, rad);
    this.dirty();
    this.dirtyTransform();
  }

  /* ************ DragAndDrop Begin ******************* */

  public onDragStart(event: SyntheticDragEvent) {
    // todo
  }

  public onDragMove(event: SyntheticDragEvent) {
    // todo
  }

  public onDragEnd(event: SyntheticDragEvent) {}

  public onDragEnter(event: SyntheticDragEvent) {}

  public onDragLeave(event: SyntheticDragEvent) {}

  public onDrop(event: SyntheticDragEvent) {}

  /* ************ DragAndDrop End ******************* */

  public dirtyClientBoundingRect() {
    this._clientBoundingRectDirty = true;
    this.parentNode?.dirtyBBox();
  }

  private _computeTransform(): mat3 {
    const out = mat3.create();
    const { rotation = 0, origin = [0, 0], position = [0, 0], scale = [1, 1] } = this.attr;
    const [sx, sy] = scale;
    // todo 旋转为0时不旋转, position[0,0]是不位移,scale[1, 1]时不计算, 避免相关计算
    mat3.translate(out, out, position);
    transformUtils.rotate(out, rotation, origin[0], origin[1]);
    transformUtils.scale(out, sx, sy, origin[0], origin[1]);
    mat3.multiply(out, out, this._baseMatrix);
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

  private _computeAbsTransform(): mat3 {
    const parentTransform = this.parentNode ? this.parentNode.getAbsTransform() : mat3.create();
    const selfTransform = this.getTransform();
    return mat3.multiply(mat3.create(), parentTransform, selfTransform);
  }
  
}
