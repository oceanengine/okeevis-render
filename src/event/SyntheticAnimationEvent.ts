import SyntheticEvent, { SyntheticEventParams } from './SyntheticEvent';
import Element from '../shapes/Element';

export interface SyntheticAnimationEventParams extends SyntheticEventParams {
  elapsedTime: number;
}

export class SyntheticAnimationEvent extends SyntheticEvent<null> {
  public syntheticType = 'animation';

  public elapsedTime: number;

  public target: Element;

  public currentTarget: Element;

  public detail: number;

  public constructor(type: string, params: SyntheticAnimationEventParams) {
    super(type, params);
    this.elapsedTime = params.elapsedTime;
  }
}
