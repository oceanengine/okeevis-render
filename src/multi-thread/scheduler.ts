import { Thread } from './thread';
import { CommandBufferEncoder, FrameData } from './command-buffer';
import { BBox } from 'src/utils/bbox';

export type RafCallback = (time: number) => void;
export type RafCallbackWithCtx = (thread: Thread, time: number) => void;
export type onDataReady = (data: CanvasImageSource, clearRects: BBox[]) => void;

let scheduler: WorkerScheduler;
let rafUserId = 1;
export class WorkerScheduler {
  private _threads: Thread[] = [];

  private _rafId: number = 1;

  private _windowRafId: number;

  private _pendingTasks: Map<number, number[]> = new Map();

  private _rafIdCbMap: Map<number, RafCallback> = new Map();

  private _frameDataQueue: FrameData[] = [];

  private _taskConfig: Record<
    number,
    {
      lastTime: number;
      onPainted: onDataReady;
      locked: boolean;
      frameCount: number;
    }
  > = {};

  public constructor() {
    this._threads = [new Thread(), new Thread(), new Thread()];
  }

  public getRaf(option: { onPainted: onDataReady }): {
    unRegisterTask: Function;
    requestAnimationFrame: Function;
    cancelAnimationFrame: RafCallback;
    commandBuffer: CommandBufferEncoder;
  } {
    const taskId = rafUserId++;
    this._taskConfig[taskId] = {
      onPainted: option.onPainted,
      locked: false,
      lastTime: 0,
      frameCount: 0,
    };
    let unregisted = false;
    const raf = (rafCb: RafCallback) => {
      if (unregisted) {
        // console.warn('work frame has been unregistered');
        return;
      }
      const idList = this._pendingTasks.get(taskId) || [];
      const id = this._rafId++;
      this._rafIdCbMap.set(id, rafCb);
      idList.push(id);
      this._pendingTasks.set(taskId, idList);
      if (!this._windowRafId) {
        this._windowRafId = requestAnimationFrame(this._queryFrame);
      }
      return id;
    };
    const caf = (id: number) => {
      const cbList = this._pendingTasks.get(taskId) || [];
      const index = cbList.indexOf(id);
      cbList.splice(index, 1);
    };
    const unRegisterTask = () => {
      unregisted = true;
      const idList = this._pendingTasks.get(taskId) || [];
      this._pendingTasks.delete(taskId);
      delete this._taskConfig[taskId];
      idList.forEach(id => this._rafIdCbMap.delete(id));
    };
    return {
      requestAnimationFrame: raf,
      cancelAnimationFrame: caf,
      unRegisterTask,
      commandBuffer: new CommandBufferEncoder({
        onCommit: data => this._commitFrameData(taskId, data),
      }),
    };
  }

  private _commitFrameData(taskId: number, data: FrameData) {
    data.taskId = taskId;
    data.rafId = this._windowRafId;
    this._frameDataQueue.unshift(data);
    this._queryThread();
  }

  private _requestTaskFrame(now: number, taskId: number, taskCbList: number[]) {
    const pendingTask = this._pendingTasks;
    const task = this._taskConfig[taskId];
    if (task.locked) {
      return;
    }
    task.locked = true;
    task.lastTime = now;
    task.frameCount++;
    pendingTask.delete(taskId);
    taskCbList.forEach(id => {
      this._rafIdCbMap.get(id)(now);
      this._rafIdCbMap.delete(id);
    });
  }

  private _queryFrame = () => {
    const pendingTask = this._pendingTasks;
    const now = performance.now();
    this._pendingTasks.forEach((taskCbList, taskId) => {
      this._requestTaskFrame(now, taskId, taskCbList);
    });
    this._windowRafId = null;
    if (pendingTask.size) {
      this._windowRafId = requestAnimationFrame(this._queryFrame);
    }
  };

  private _queryThread() {
    const idleThread = this._getIdleThread();
    if (idleThread && this._frameDataQueue.length) {
      const frameData = this._frameDataQueue.pop();
      idleThread.run(frameData, data => {
        const taskId = frameData.taskId;
        const task = this._taskConfig[taskId];
        task.locked = false;
        task.onPainted(data, frameData.clearRects);
        // if (this._windowRafId > frameData.rafId) {
        //   this._requestTaskFrame(performance.now(), taskId, this._pendingTasks.get(taskId));
        // }
        this._queryThread();
      });
      if (this._frameDataQueue.length) {
        this._queryThread();
      }
    }
  }

  private _getIdleThread(): Thread | undefined {
    for (const thread of this._threads) {
      if (thread.isIdle()) {
        return thread;
      }
    }
  }
}

export function getScheduler(): WorkerScheduler {
  if (scheduler) {
    return scheduler;
  }
  scheduler = new WorkerScheduler();
  return scheduler;
}
