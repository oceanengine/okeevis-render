import CompositeEvent from './CompositeEvent';
import Element from '../shapes/Element';

export default class CompositeMouseEvent extends CompositeEvent<MouseEvent> {
  public x: number;

  public y: number;

  public target: Element;

  public detail: number;
}