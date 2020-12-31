import Eventful from '../utils/Eventful';
import Render from '../render';
import Group from './Group';
import AnimateAble, { AnimateConf, AnimateOption } from '../animate/AnimateAble';
import { EasingName } from '../animate/ease';

declare type Color = any;

export interface CommonAttr {
  key?: string;
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

export type AttrConf<T> = {
  [key in keyof T]: {
    animateAble: boolean;
    defaultValue: any;
    effectShape: boolean;
  };
};

const ElementAttrConf: AttrConf<CommonAttr> = {
  fill: {
    animateAble: true,
    defaultValue: null,
    effectShape: false,
  },
  stroke: {
    animateAble: true,
    defaultValue: null,
    effectShape: false,
  },
};

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default class Element<T extends CommonAttr = any> extends Eventful implements AnimateAble<T> {
  public attr: T;

  public type: string;

  public fillAble: boolean = true;
  
  public strokeAble: boolean = true;

  private _animations: AnimateOption<T>[] = [];

  public renderer: Render | undefined;

  public parentNode: Group | undefined;

  private _bbox: BBox = { x: 0, y: 0, width: 0, height: 0 };

  private _clientBoundingRect: BBox;

  private _lastFrameTime: number;

  public static attrConf: AttrConf<CommonAttr> = ElementAttrConf;
  

  public constructor(attr: T = {} as T) {
    super();
    this.attr = attr;
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

  public setAttr(attr: T) {
    this.attr = { ...this.attr, ...attr };
    this.dirty();
  }

  public addAnimation(option: AnimateOption<T>) {
    option.statTime = this._lastFrameTime;
    this._animations.push(option);
  }

  public getAttr(key: keyof T): any {
    return this.attr[key];
  }

  public animateTo(toAttr: T, duringOrConf?: number | AnimateConf, ease?: EasingName, callback?: Function, delay?: number) {
    
    const fromAttr = this.attr;
    if (typeof duringOrConf === 'object') {
      this.addAnimation({
        stopped: false,
        from: fromAttr,
        to: toAttr,
        ...duringOrConf,
        animationKeys: [],
      })
    } else {
      this.addAnimation({
        from: fromAttr,
        to: toAttr,
        ease,
        callback,
        delay,
        stopped: false,
        animationKeys: [],
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
  }

  public getBBox(): BBox {
    if (!this._bbox) {
      this._bbox = this.computeBBox();
    }
    return this._bbox;
  }

  public getClientBoundingRect(): BBox {
    return this._clientBoundingRect;
  }

  // todo
  public getTransform() {

  }

  public computeBBox(): BBox {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  public onFrame(now: number) {
    this._lastFrameTime = now;
  }

  public destroy() {
    this.parentNode = null;
    this.renderer = null;
    this.stopAllAnimation();
    this.removeAllListeners();
  }
}
