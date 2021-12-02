import SyntheticMouseEvent, { SyntheticMouseEventParams } from './SyntheticMouseEvent';

export interface SyntheticDragEventParams extends SyntheticMouseEventParams {
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  dx: number;
  dy: number;
}

export default class SyntheticDragEvent extends SyntheticMouseEvent<DragEvent> {
  public syntheticType = 'dnd';

  public startX: number;

  public startY: number;

  public offsetX: number;

  public offsetY: number;

  public dx: number;

  public dy: number;

  public constructor(type: string, params: SyntheticDragEventParams) {
    super(type, params);
    this.startX = params.startX;
    this.startY = params.startY;
    this.offsetX = params.offsetX;
    this.offsetY = params.offsetY;
    this.dx = params.dx;
    this.dy = params.dy;
  }
}
