/* eslint-disable lines-between-class-members */
import SyntheticDragEvent from '../event/SyntheticDragEvent';

export interface DragAndDropConf {
  draggable?: boolean;
  onDrag?: (event: SyntheticDragEvent) => void;
  onDragend?: (event: SyntheticDragEvent) => void;
  onDragstart?: (event: SyntheticDragEvent) => void;
  onDragenter?: (event: SyntheticDragEvent) => void;
  onDragleave?: (event: SyntheticDragEvent) => void;
  onDrop?: (event: SyntheticDragEvent) => void;
  getDragOffset?: (event: SyntheticDragEvent) => { x: number; y: number };
}
