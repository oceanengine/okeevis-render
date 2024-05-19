import SyntheticEvent, { SyntheticEventParams } from './SyntheticEvent';
import Element from '../shapes/Element';

export interface SyntheticKeyboardEventParams extends SyntheticEventParams {
  altKey: boolean;
  /** @deprecated */
  char: string;
  /** @deprecated */
  charCode: number;
  code: string;
  ctrlKey: boolean;
  isComposing: boolean;
  key: string;
  /** @deprecated */
  keyCode: number;
  location: number;
  metaKey: boolean;
  repeat: boolean;
  shiftKey: boolean;
}

export class SyntheticKeyboardEvent extends SyntheticEvent<KeyboardEvent> {
  public syntheticType = 'keyboardEvent';
  
  public altKey: boolean;
  /** @deprecated */
  public char: string;
  /** @deprecated */
  public charCode: number;
  public code: string;
  public ctrlKey: boolean;
  public isComposing: boolean;
  public key: string;
  /** @deprecated */
  public keyCode: number;
  public location: number;
  public metaKey: boolean;
  public repeat: boolean;
  public shiftKey: boolean;

  public target: Element;

  public currentTarget: Element;

  public constructor(type: string, params: SyntheticKeyboardEventParams) {
    super(type, params);
    const { altKey, char, charCode, code, ctrlKey, isComposing,key, keyCode, location, metaKey, repeat, shiftKey } = params;
    this.altKey = altKey;
    this.char = char;
    this.charCode = charCode;
    this.code = code;
    this.ctrlKey = ctrlKey;
    this.isComposing = isComposing;
    this.key = key;
    this.keyCode = keyCode;
    this.location = location;
    this.metaKey = metaKey;
    this.repeat = repeat;
    this.shiftKey = shiftKey;
  }
}
