import SyntheticEvent, { SyntheticEventParams } from './SyntheticEvent';
import Element from '../shapes/Element';

export interface SyntheticMouseEventParams extends SyntheticEventParams {
  x: number;
  y: number;
}

export default class SyntheticMouseEvent<T extends MouseEvent = MouseEvent> extends SyntheticEvent<T> {
  public syntheticType = 'mouse';

  public x: number;

  public y: number;

  public detail: number;

  public constructor(type: string, params: SyntheticMouseEventParams) {
    super(type, params);
    this.x = params.x;
    this.y = params.y;
  }
}
