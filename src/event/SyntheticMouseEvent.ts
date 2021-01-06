import SyntheticEvent from './SyntheticEvent';
import Element from '../shapes/Element';

/**
 * 含滚动事件
 */

export default class SyntheticMouseEvent extends SyntheticEvent<MouseEvent> {
  public x: number;

  public y: number;

  public target: Element;

  public detail: number;

}