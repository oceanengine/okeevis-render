import SyntheticMouseEvent from './SyntheticMouseEvent';

export default class SyntheticDragEvent extends SyntheticMouseEvent {
  public startX: number;

  public startY: number;

  public offsetX: number;

  public offsetY: number;

  public dx: number;

  public dy: number; 

}