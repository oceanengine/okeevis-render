import CompositeEvent from './CompositeEvent';
import Element from '../shapes/Element';

export interface CompositeTouch {
  readonly identifier: number;
  x: number;
  y: number;
  target: Element;
}

export default class CompositeMouseEvent extends CompositeEvent<TouchEvent> {
  public touches: CompositeTouch[];

  public changedTouches: CompositeTouch[];
}