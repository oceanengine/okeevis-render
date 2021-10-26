import SyntheticEvent, { SyntheticEventParams } from './SyntheticEvent';
import Element from '../shapes/Element';

export interface SyntheticMouseEventParams extends SyntheticEventParams {
  x: number;
  y: number;
}

export default class SyntheticMouseEvent extends SyntheticEvent<MouseEvent> {
  public syntheticType = 'mouse';

  public x: number;

  public y: number;

  public target: Element;

  public currentTarget: Element;

  public detail: number;

  public constructor(type: string, params: SyntheticMouseEventParams) {
    super(type, params);
    this.x = params.x;
    this.y = params.y;
  }
}
