import SyntheticEvent, { SyntheticEventParams } from './SyntheticEvent';
import Element from '../shapes/Element';

export interface SyntheticTouchEventParams extends SyntheticEventParams {
  touches: SyntheticTouch[];
  changedTouches: SyntheticTouch[];
}

export interface SyntheticTouch {
  readonly identifier: number;
  x: number;
  y: number;
  target: Element;
  currentTarget?: Element;
}

export default class SyntheticTouchEvent extends SyntheticEvent<TouchEvent> {
  public syntheticType = 'touch';

  public touches: SyntheticTouch[];

  public changedTouches: SyntheticTouch[];

  public constructor(type: string, params: SyntheticTouchEventParams) {
    super(type, params);
    this.touches = params.touches;
    this.changedTouches = params.changedTouches;
  }
}
