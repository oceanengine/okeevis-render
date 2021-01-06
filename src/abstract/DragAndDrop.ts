/* eslint-disable lines-between-class-members */
import CompositeDragEvent from '../event/CompositeDragEvent';


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
  public abstract onDragStart(event: CompositeDragEvent): void;
  public abstract onDragMove(event: CompositeDragEvent): void;
  public abstract onDragEnd(event: CompositeDragEvent): void;
  public abstract onDragEnter(event: CompositeDragEvent): void;
  public abstract onDragLeave(event: CompositeDragEvent): void;
  public abstract onDrop(event: CompositeDragEvent): void;
}
