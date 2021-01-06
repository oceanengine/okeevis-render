import CompositeMouseEvent from './CompositeMouseEvent';

export default class CompositeDragEvent extends CompositeMouseEvent {
  public startX: number;

  public startY: number;

  public offsetX: number;

  public offsetY: number;

  public dx: number;

  public dy: number; 

}