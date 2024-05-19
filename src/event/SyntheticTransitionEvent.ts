import SyntheticEvent, { SyntheticEventParams } from './SyntheticEvent';
import Element from '../shapes/Element';

export interface SyntheticTransitionEventParams extends SyntheticEventParams {
  elapsedTime: number;
  propertyName: string;
}

export class SyntheticTransitionEvent<T extends MouseEvent = MouseEvent> extends SyntheticEvent<T> {
  public syntheticType = 'Transition';

  public elapsedTime: number;

  public propertyName: string;

  public target: Element;

  public currentTarget: Element;

  public detail: number;

  public constructor(type: string, params: SyntheticTransitionEventParams) {
    super(type, params);
    this.elapsedTime = params.elapsedTime;
    this.propertyName = params.propertyName;
  }
}
