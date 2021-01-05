import Eventful from '../utils/Eventful';
import Render from '../render';
import Group from './Group';
import * as lodash from '../utils/lodash';
import AnimateAble, { AnimateConf, AnimateOption } from '../animate/AnimateAble';
import { EasingName } from '../animate/ease';
import {interpolateAttr, } from '../interpolate'

declare type Color = any;

export interface BaseAttr {
  key?: string;
  ref?: {current: Element};
  display?: boolean;
  zIndex?: number;

  fill?: Color;
  stroke?: Color;
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

  clip?: Element;

  rotation?: number;
  position?: [number, number];
  scale?: [number, number];
  origin?: [number, number];
  rotationOrigin?: [number, number];
  scaleOrigin?: [number, number];

  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  cursor?: string;
  pointerEvents?: 'none' | 'auto';
}

export interface CommonAttr<T extends BaseAttr = BaseAttr> extends BaseAttr {
  transitionProperty?: 'all' | 'none' | Array<keyof T>
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

export default class Element<T extends CommonAttr = any> extends Eventful implements AnimateAble<T> {
  public attr: T = {} as T;

  public type: string;

  public fillAble: boolean = true;
  
  public strokeAble: boolean = true;

  private _animations: AnimateOption<T>[] = [];

  public renderer: Render | undefined;

  public parentNode: Group | undefined;

  public isClip: boolean = false;

  private _bbox: BBox = { x: 0, y: 0, width: 0, height: 0 };
  
  private _bboxDirty: boolean = true;

  private _transformDirty: boolean = true;

  private _transform: number[];

  private _clientBoundingRect: BBox;  
  
  public constructor(attr: T = {} as T) {
    super();
    const initAttr = {...this.getDefaultAttr(), ...attr};
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
      'rotationOrigin',
      'scaleOrigin',
      'shadowColor',
      'shadowBlur',
      'shadowOffsetX',
      'shadowOffsetY',
    ] as Array<keyof CommonAttr>
  }

  public getDefaultAttr(): T {
    return {
      display: true,
      zIndex: 0,
      rotation: 0,
      position: [0, 0],
      scale: [1, 1],
      origin: [0, 0],
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
      return
    }
    this.attr = { ...this.attr, ...attr };
    this.dirty();
    return this;
  }

  public addAnimation(option: AnimateOption<T>) {
    this._animations.push(option);
  }

  public getAttr(key: keyof T): any {
    return this.attr[key];
  }

  public animateTo(toAttr: T, duringOrConf: number | AnimateConf = 400, ease?: EasingName, callback?: Function, delay?: number) {
    
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
      })
    } else {
      this.addAnimation({
        from: animateFromAttr,
        to: animateToAttr,
        during: duringOrConf,
        ease,
        callback,
        delay,
        stopped: false,
      })
    }
  }

  public stopAllAnimation() {
    this._animations = [];
    return this;
  }

  public dirty() {
    if (this.renderer) {
      this.renderer.dirty();
    }
    const clip = this.attr.clip;
    if (clip) {
      clip.renderer = this.renderer;
    }
    if (this.attr.ref) {
      this.attr.ref.current = this;
    }
  }

  public getBBox(): BBox {
    if (!this._bbox) {
      this._bbox = this.computeBBox();
    }
    return this._bbox;
  }

  public getTransform(): number[] {
    return this._transform;
  }

  public getClientBoundingRect(): BBox {
    return this._clientBoundingRect;
  }

  public computeBBox(): BBox {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  public onFrame(now: number) {
    this._animations.forEach(animate => {
      const { startTime, during, from, to, ease, callback, onFrame, delay } = animate;
      let progress = 0;
      if (startTime) {
        progress = Math.min((now - startTime) / during, 1);
      } else {
        animate.startTime = now;
      }
      const attr = interpolateAttr(from, to, progress);
      if (progress === 1) {
        callback  && callback();
        animate.stopped = true;
      }
      this.setAttr(attr);
      onFrame && onFrame(progress);
    })
    this._animations = this._animations.filter(item => !item.stopped);
  }

  public destroy() {
    this.parentNode = null;
    this.renderer = null;
    this.stopAllAnimation();
    this.removeAllListeners();
  }
  
  public created() {
    // do nothing
  }

  public mounted() {
    // do nothing
  }
}
