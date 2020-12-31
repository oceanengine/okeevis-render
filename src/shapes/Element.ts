import Eventful from '../utils/Eventful';
import Render from '../render';
import Group from './Group';
import AnimateAble, {
  AnimateOption,
} from '../animate/AnimateAble';


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

export type AttrConf< T > = {
  [key in keyof T]: {
    animateAble: boolean;
    defaultValue: any;
    effectShape: boolean;
  }
}

const ElementAttrConf: AttrConf< CommonAttr > = {
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
}

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default  class Element < T extends CommonAttr = CommonAttr > extends Eventful implements AnimateAble<CommonAttr & T> {

  public  attr: T;

  public type: string;

  private _animations: AnimateOption[] = [];

  public renderer: Render;
  public parentNode: Group;
  public bbox: BBox = {x: 0, y: 0, width: 0, height: 0};
  public clientBoundingRect: BBox;

  public static attrConf: AttrConf<CommonAttr> = ElementAttrConf;

  public setAttr(attr: T) {
    this.attr = {...this.attr, attr};
    this.dirty();
  }

  public addAnimation(option: AnimateOption) {
    option.statTime = Date.now();
    this._animations.push(option);
  }

  public getAttr(key: keyof (T)): any {
    return this.attr[key];
  }

  public animateTo() {

  }

  public stopAllAnimation() {
    this._animations.forEach(animation => animation.stopped = true);
    this._animations = [];
    return this;
  }

  public dirty() {
    // todo
  }

  public render() {
    // nothing
  }

  public getBBox(): BBox {
    if (!this.bbox) {
      this.bbox = this.computeBBox();
    }
    return this.bbox;
  }

  public computeBBox(): BBox {
    return {x: 0, y: 0, width: 0, height: 0};
  }

  public destroy() {
    this.parentNode = null;
    this.renderer = null;
    this.stopAllAnimation();
    this.removeAllListeners();
  }

}