import SyntheticEvent, { SyntheticEventParams } from './SyntheticEvent';
import Element from '../shapes/Element';

export interface SyntheticTouchEventParams extends SyntheticEventParams {
  touches: SyntheticTouch[];
  changedTouches: SyntheticTouch[];
  x: number;
  y: number;
}

export interface SyntheticTouch {
  readonly identifier: number;
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  target: Element;
  currentTarget?: Element;
}

export default class SyntheticTouchEvent extends SyntheticEvent<TouchEvent> {
  public syntheticType = 'touch';

  public touches: SyntheticTouch[];

  public changedTouches: SyntheticTouch[];

  public x: number;

  public y: number;

  public constructor(type: string, params: SyntheticTouchEventParams) {
    super(type, params);
    this.touches = params.touches;
    this.changedTouches = params.changedTouches;
    this.x = params.x;
    this.y = params.y;
  }
}
