import Eventful from '../utils/Eventful';
import Render from '../render';
import Group from './Group';
import * as lodash from '../utils/lodash';
import {ColorValue, } from '../color';
import AnimateAble, { AnimateConf, AnimateOption } from '../abstract/AnimateAble';
import SyntheticDragEvent from '../event/SyntheticDragEvent'
import DragAndDrop, {DragAndDropConf, } from '../abstract/DragAndDrop';
import { EasingName } from '../animate/ease';
import interpolateAttr from '../interpolate/interpolateAttr';
import TransformAble, { TransformConf } from '../abstract/TransformAble';
import Shape from './Shape';
import * as mat3 from '../../js/mat3';

export interface BaseAttr extends TransformConf, DragAndDropConf {
  key?: string;
  ref?: { current: Element };
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

  clip?: Shape;

  shadowColor?: ColorValue;
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

export default class Element<T extends CommonAttr = any>
  extends Eventful
  implements AnimateAble<T>, TransformAble, DragAndDrop {
  public attr: T = {} as T;

  public type: string;

  public readonly shapeKeys: Array<keyof T> = [];

  public fillAble: boolean = true;

  public strokeAble: boolean = true;

  public ownerRender: Render | undefined;

  public parentNode: Group | undefined;

  private _animations: AnimateOption<T>[] = [];
  
  private _bbox: BBox = { x: 0, y: 0, width: 0, height: 0 };

  private _bboxDirty: boolean = true;

  private _transform: mat3;
  
  private _transformDirty: boolean = true;

  private _baseMatrix: mat3 = mat3.create();


  private _clientBoundingRect: BBox;

  private _clientBoundingRectDirty: boolean = true;

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
      fillOpacity: 1,
      strokeOpacity: 1,
      shadowBlur: 0,
    } as T;
  }

  public getComputedAttr(): T {
    return this.attr;
  }

  public setAttr(attr: T = {} as T): this {
    if (lodash.keys(attr).length === 0) {
      return;
    }
    const prevAttr = this.attr;
    this.attr = { ...this.attr, ...attr };
    this.dirty();
    this.updated(prevAttr, attr);
    return this;
  }

  public dirty() {
    if (this.ownerRender) {
      this.ownerRender.dirty();
    }
    this._mountClip();    
    if (this.attr.ref) {
      this.attr.ref.current = this;
    }
  }

  public getBBox(): BBox {
    if (!this._bbox || this._bboxDirty) {
      this._bbox = this.computeBBox();
      this._bboxDirty = false;
    }
    return this._bbox;
  } 

  public getClientBoundingRect(parentTransform?: mat3): BBox {
    if (!this._clientBoundingRect || this._clientBoundingRectDirty) {
      this._clientBoundingRect = this._computClientBoundingRect(parentTransform);
      this._clientBoundingRectDirty = false;
    }
    return this._clientBoundingRect;
  }

  public computeBBox(): BBox {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  public created() {
    // do nothing
  }

  public updated(prevAttr: T, nextAttr: T) {
    const transformKeys: Array<keyof CommonAttr> = ['origin', 'position', 'rotation'].filter(key => !lodash.isUndefined((nextAttr as any)[key])) as any;
    const shapeKeys = this.shapeKeys.filter(key => !lodash.isUndefined(nextAttr[key]));
    
    
    if (transformKeys.length) {
      // todo 精确判断数组变化
      this._dirtyTransform();
    }

    if (shapeKeys.some(key => prevAttr[key] !== nextAttr[key])) {
      this._dirtyBBox();
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
    const animationKeys = this.getAnimationKeys().filter(key => {
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

  public stopAllAnimation() {
    this._animations = [];
    return this;
  }

  public onFrame(now: number) {
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

  public resetTransform() {
    this._baseMatrix = mat3.create();
    this.dirty();
    this._dirtyTransform();
  }

  public setBaseTransform(matrix: mat3) {
    this._baseMatrix = matrix;
  }

  public translate(dx: number, dy: number) {
    this._baseMatrix = mat3.translate(this._baseMatrix, this._baseMatrix, [dx, dy]);
    this.dirty();
    this._dirtyTransform();
  }

  public scale(sx: number, sy: number = sx) {
    this._baseMatrix = mat3.scale(this._baseMatrix, this._baseMatrix, [sx, sy]);
    this.dirty();
    this._dirtyTransform();
  }

  public rotate(rad: number) {
    this._baseMatrix = mat3.rotate(this._baseMatrix, this._baseMatrix, rad);
    this.dirty();
    this._dirtyTransform();
  }

  /* ************ DragAndDrop Begin ******************* */

  public onDragStart(event: SyntheticDragEvent) {
    // todo
  }

  public onDragMove(event: SyntheticDragEvent) {
    // todo
  }

  public onDragEnd(event: SyntheticDragEvent) {

  }

  public onDragEnter(event: SyntheticDragEvent) {
    
  }

  public onDragLeave(event: SyntheticDragEvent) {
    
  }

  public onDrop(event: SyntheticDragEvent) {
    
  }

  /* ************ DragAndDrop End ******************* */

  public dirtyClientBoundingRect() {
    this._clientBoundingRectDirty = true;
  }

  private _computeTransform(): mat3 {
    const out = mat3.create();
    const { rotation = 0, origin = [1, 1], position = [0, 0], scale = [1, 1] } = this.attr;
    mat3.rotate(out, out, rotation);
    mat3.multiply(out, out, this._baseMatrix);
    return out;
  }

  private _computClientBoundingRect(parentTransform?: mat3): BBox {
    if (parentTransform) {
      // todo
    } else {
      // todo
    }
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  private _dirtyTransform() {
    this._transformDirty = true;
    this._clientBoundingRectDirty = true;
  }

  private _dirtyBBox() {
    this._bboxDirty = true;
    this._clientBoundingRectDirty = true;
  }
  

  private _mountClip() {
    const clip = this.attr.clip;
    if (clip) {
      clip.ownerRender = this.ownerRender;
    }
  }
}
