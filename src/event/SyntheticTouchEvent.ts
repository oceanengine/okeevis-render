import SyntheticEvent from './SyntheticEvent';
import Element from '../shapes/Element';

export interface SyntheticTouch {
  readonly identifier: number;
  x: number;
  y: number;
  target: Element;
  currentTarget: Element;
}

export default class SyntheticTouchEvent extends SyntheticEvent<TouchEvent> {
  public touches: SyntheticTouch[];

  public changedTouches: SyntheticTouch[];
}