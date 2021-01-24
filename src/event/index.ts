import SyntheticEvent from  './SyntheticEvent';
import SyntheticMouseEvent from './SyntheticMouseEvent';
import SyntheticDragEvent from './SyntheticDragEvent';
import SyntheticTouchEvent from  './SyntheticTouchEvent'

export {
  SyntheticEvent,
  SyntheticMouseEvent,
  SyntheticDragEvent,
  SyntheticTouchEvent,
}

// todo 和react一致
export interface EventConf {
  draggable?: boolean;
  onMouseMove?: (event: SyntheticMouseEvent) => void;
  onMouseDown?: (event: SyntheticMouseEvent) => void;
  onMouseUp?: (event: SyntheticMouseEvent) => void;
  onMouseOut?: (event: SyntheticMouseEvent) => void;
  onMouseOver?: (event: SyntheticMouseEvent) => void;
  onClick?: (event: SyntheticMouseEvent) => void;
  onDblClick?: (event: SyntheticMouseEvent) => void;
  onMouseLeave?: (event: SyntheticMouseEvent) => void;
  onMouseEnter?: (event: SyntheticMouseEvent) => void;
  onWheel?: (event: SyntheticMouseEvent) => void;
  onDragStart?: (event: SyntheticDragEvent) => void;
  onDrag?: (event: SyntheticDragEvent) => void;
  onDragEnd?: (event: SyntheticDragEvent) => void;
  onDragOver?: (event: SyntheticDragEvent) => void;
  onDragLeave?: (event: SyntheticDragEvent) => void;
  onDrop?: (event: SyntheticDragEvent) => void;
  getDragOffset?: (event: SyntheticDragEvent) => {x: number, y: number};
  onTouchMove?: (event: SyntheticTouchEvent) => void;
  onTouchStart?: (event: SyntheticTouchEvent) => void;
  onTouchEnd?: (event: SyntheticTouchEvent) => void;
}