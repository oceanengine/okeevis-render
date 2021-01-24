import SyntheticEvent, { SyntheticEventParams } from './SyntheticEvent';
import Element from '../shapes/Element';

/**
 * 含滚动事件
 */

export interface SyntheticMouseEventParams extends SyntheticEventParams {
  x: number;
  y: number;
  detail?: any;
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
    this. y = params.y;
    this.detail = params.detail;
  }
}
