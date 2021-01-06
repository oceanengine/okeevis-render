import CompositeEvent from './CompositeEvent';
import Element from '../shapes/Element';

/**
 * 含滚动事件
 */

export default class CompositeMouseEvent extends CompositeEvent<MouseEvent> {
  public x: number;

  public y: number;

  public target: Element;

  public detail: number;

}