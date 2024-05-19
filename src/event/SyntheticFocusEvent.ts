import SyntheticEvent, { SyntheticEventParams } from './SyntheticEvent';
import Element from '../shapes/Element';

export type SyntheticFocusEventParams = SyntheticEventParams;
export class SyntheticFocusEvent extends SyntheticEvent<FocusEvent | KeyboardEvent> {
  public syntheticType = 'focusEvent';

  public target: Element;

  public currentTarget: Element;

}
