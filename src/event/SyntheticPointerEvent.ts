import SyntheticMouseEvent, { SyntheticMouseEventParams } from './SyntheticMouseEvent';

export interface SyntheticPointerEventParams extends SyntheticMouseEventParams {
   isPrimary: boolean;
   pressure: number;
   tiltX: number;
}

export default class SyntheticPointerEvent extends SyntheticMouseEvent<MouseEvent> {
  public syntheticType = 'pointer';

  public constructor(type: string, params: SyntheticPointerEventParams) {
    super(type, params);
  }
}
