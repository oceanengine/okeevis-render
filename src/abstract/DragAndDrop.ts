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
  getDragOffset?: (event: SyntheticDragEvent) => void;
}

export default abstract class DragAndDrop {
  public abstract onDragStart(event: SyntheticDragEvent): void;
  public abstract onDragMove(event: SyntheticDragEvent): void;
  public abstract onDragEnd(event: SyntheticDragEvent): void;
  public abstract onDragEnter(event: SyntheticDragEvent): void;
  public abstract onDragLeave(event: SyntheticDragEvent): void;
  public abstract onDrop(event: SyntheticDragEvent): void;
}
