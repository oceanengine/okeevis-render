import SyntheticEvent from './SyntheticEvent';
import SyntheticMouseEvent from './SyntheticMouseEvent';
import SyntheticDragEvent from './SyntheticDragEvent';
import SyntheticTouchEvent from './SyntheticTouchEvent';
import SyntheticWheelEvent from './SyntheticWheelEvent';
import { SyntheticAnimationEvent } from './SyntheticAnimationEvent';
import { SyntheticFocusEvent } from './SyntheticFocusEvent';
import { SyntheticKeyboardEvent } from './SyntheticKeyboardEvent';
import { SyntheticTransitionEvent, } from './SyntheticTransitionEvent'
export {
  SyntheticEvent,
  SyntheticMouseEvent,
  SyntheticDragEvent,
  SyntheticTouchEvent,
  SyntheticWheelEvent,
  SyntheticAnimationEvent,
  SyntheticFocusEvent,
  SyntheticKeyboardEvent,
  SyntheticTransitionEvent
};

export interface EventConf {
  draggable?: boolean;
  onEvent?: (event: SyntheticEvent) => void;
  onMounted?: () => void;
  onContextMenu?: (event: SyntheticMouseEvent) => void;
  onMouseMove?: (event: SyntheticMouseEvent) => void;
  onMouseDown?: (event: SyntheticMouseEvent) => void;
  onMouseUp?: (event: SyntheticMouseEvent) => void;
  onMouseOut?: (event: SyntheticMouseEvent) => void;
  onMouseOver?: (event: SyntheticMouseEvent) => void;
  onClick?: (event: SyntheticMouseEvent) => void;
  onDblClick?: (event: SyntheticMouseEvent) => void;
  onMouseLeave?: (event: SyntheticMouseEvent) => void;
  onMouseEnter?: (event: SyntheticMouseEvent) => void;
  onWheel?: (event: SyntheticWheelEvent) => void;
  onDragStart?: (event: SyntheticDragEvent) => void;
  onDrag?: (event: SyntheticDragEvent) => void;
  onDragEnd?: (event: SyntheticDragEvent) => void;
  onDragEnter?: (event: SyntheticDragEvent) => void;
  onDragOver?: (event: SyntheticDragEvent) => void;
  onDragLeave?: (event: SyntheticDragEvent) => void;
  onDrop?: (event: SyntheticDragEvent) => void;
  getDragOffset?: (event: SyntheticDragEvent) => { x: number; y: number };
  onTouchMove?: (event: SyntheticTouchEvent) => void;
  onTouchStart?: (event: SyntheticTouchEvent) => void;
  onTouchEnd?: (event: SyntheticTouchEvent) => void;
  onAnimationStart?: (event: SyntheticAnimationEvent) => void;
  onAnimationCancel?: (event: SyntheticAnimationEvent) => void;
  onAnimationEnd?: (event: SyntheticAnimationEvent) => void;
  onTransitionStart?:(event: SyntheticTransitionEvent) => void;
  onTransitionEnd?:(event: SyntheticTransitionEvent) => void;
  onTransitionCancel?:(event: SyntheticTransitionEvent) => void;
  onFocus?: (event: SyntheticFocusEvent) => void;
  onBlur?: (event: SyntheticFocusEvent) => void;
  onFocusIn?: (event: SyntheticFocusEvent) => void;
  onFocusOut?: (event: SyntheticFocusEvent) => void;
  onKeyDown?: (event: SyntheticKeyboardEvent) => void;
  onKeyUP?: (event: SyntheticKeyboardEvent) => void;
  onKeyPress?: (event: SyntheticKeyboardEvent) => void;
}

export type RenderEventHandleParam = {
  contextmenu: [SyntheticMouseEvent];
  mousemove: [SyntheticMouseEvent];
  mousedown: [SyntheticMouseEvent];
  mouseup: [SyntheticMouseEvent];
  mouseout: [SyntheticMouseEvent];
  mouseover: [SyntheticMouseEvent];
  click: [SyntheticMouseEvent];
  dblclick: [SyntheticMouseEvent];
  mouseleave: [SyntheticMouseEvent];
  wheel: [SyntheticWheelEvent];
  dragstart: [SyntheticDragEvent];
  drag: [SyntheticDragEvent];
  dragend: [SyntheticDragEvent];
  dragenter: [SyntheticDragEvent];
  dragover: [SyntheticDragEvent];
  dragleave: [SyntheticDragEvent];
  drop: [SyntheticDragEvent];
  touchmove: [SyntheticTouchEvent];
  touchstart: [SyntheticTouchEvent];
  touchend: [SyntheticTouchEvent];
  touchcancel: [SyntheticTouchEvent];
  animationstart: [SyntheticAnimationEvent];
  animationend: [SyntheticAnimationEvent];
  animationcancel: [SyntheticAnimationEvent];
  transitionstart: [SyntheticTransitionEvent];
  transitionend: [SyntheticTransitionEvent];
  transitioncancel: [SyntheticTransitionEvent];
  focus: [SyntheticFocusEvent];
  blur: [SyntheticFocusEvent];
  focusin: [SyntheticFocusEvent];
  focusout: [SyntheticFocusEvent];
  keydown: [SyntheticKeyboardEvent];
  keyup: [SyntheticKeyboardEvent];
  keypress: [SyntheticKeyboardEvent];
  [key: string]: any[];
};
