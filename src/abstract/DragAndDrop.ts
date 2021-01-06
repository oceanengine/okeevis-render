/* eslint-disable lines-between-class-members */
import SyntheticDragEvent from '../event/SyntheticDragEvent';


export interface DragAndDropConf {
  draggable?: boolean;
  onDragstart?: Function;
  onDrag?: Function;
  onDragend?: Function;
  onDragenter?: Function;
  onDragleave?: Function;
  onDrop?: Function;
  getDragOffset?: Function;
}

export default abstract class DragAndDrop {
  public abstract onDragStart(event: SyntheticDragEvent): void;
  public abstract onDragMove(event: SyntheticDragEvent): void;
  public abstract onDragEnd(event: SyntheticDragEvent): void;
  public abstract onDragEnter(event: SyntheticDragEvent): void;
  public abstract onDragLeave(event: SyntheticDragEvent): void;
  public abstract onDrop(event: SyntheticDragEvent): void;
}
