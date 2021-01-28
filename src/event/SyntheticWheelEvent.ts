import SyntheticMouseEvent, { SyntheticMouseEventParams } from './SyntheticMouseEvent';

// https://gist.github.com/akella/11574989a9f3cc9e0ad47e401c12ccaf

export interface NormalLizeWheel {
  spinX: number;
  spinY: number;
  pixelX: number;
  pixelY: number;
}

export interface SyntheticWheelEventParams extends SyntheticMouseEventParams {
  deltaMode: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
  normalizeWheel: NormalLizeWheel;
}

export default class SyntheticWheelEvent extends SyntheticMouseEvent {
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
    this.normalizeWheel = params.normalizeWheel
  }
}
