import SyntheticMouseEvent from './SyntheticMouseEvent';
import SyntheticDragEvent from './SyntheticDragEvent';
import SyntheticTouchEvent from  './SyntheticTouchEvent'

export interface EventConf {
  onMouseMove?: (event: SyntheticMouseEvent) => void;
  onMouseDown?: (event: SyntheticMouseEvent) => void;
  onMouseUp?: (event: SyntheticMouseEvent) => void;
  onMouseOut?: (event: SyntheticMouseEvent) => void;
  onMouseOver?: (event: SyntheticMouseEvent) => void;
  onClick?: (event: SyntheticMouseEvent) => void;
  onDblclick?: (event: SyntheticMouseEvent) => void;
  onMouseLeave?: (event: SyntheticMouseEvent) => void;
  onMouseEnter?: (event: SyntheticMouseEvent) => void;
  onMouseWheel?: (event: SyntheticMouseEvent) => void;
  onDrag?: (event: SyntheticDragEvent) => void;
  onDragend?: (event: SyntheticDragEvent) => void;
  onDragstart?: (event: SyntheticDragEvent) => void;
  onTouchMove?: (event: SyntheticTouchEvent) => void;
  onTouchStart?: (event: SyntheticTouchEvent) => void;
  onTouchEnd?: (event: SyntheticTouchEvent) => void;
}