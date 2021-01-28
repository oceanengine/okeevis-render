import {NormalLizeWheel, } from 'normalize-wheel'
import SyntheticMouseEvent, { SyntheticMouseEventParams } from './SyntheticMouseEvent';

// https://gist.github.com/akella/11574989a9f3cc9e0ad47e401c12ccaf

export interface SyntheticWheelEventParams extends SyntheticMouseEventParams {
  deltaMode: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
  normalizeWheel: NormalLizeWheel;
}

export default class SyntheticDragEvent extends SyntheticMouseEvent {
  public syntheticType = 'wheel';

  public deltaMode: number;

  public deltaX: number;

  public deltaY: number;

  public deltaZ: number;

  public normalizeWheel: NormalLizeWheel;

  public constructor(type: string, params: SyntheticWheelEventParams) {
    super(type, params);
    this.deltaMode = params.deltaMode;
    this.deltaX = params.deltaX;
    this.deltaY = params.deltaY;
    this.deltaZ = params.deltaZ;
    this.normalizeWheel = params.normalizeWheel;
  }
}
