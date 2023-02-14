import { Thread } from './thread';
import { CommandBufferEncoder, FrameData } from './command-buffer';

export type RafCallback = (time: number) => void;
export type RafCallbackWithCtx = (thread: Thread, time: number) => void;
export type onDataReady = (data: CanvasImageSource) => void;

let scheduler: WorkerScheduler;
let rafUserId = 1;
export class WorkerScheduler {
  private _threads: Thread[] = [];

  private _rafId: number = 1;

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
      frameData: FrameData;
      oneFrameBehind: boolean;
    }
  > = {};

  public constructor() {
    this._threads = [new Thread(), new Thread(), new Thread()];
  }

  public getRaf(option: {onPainted: onDataReady; oneFrameBehind: boolean}): {
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
      frameData: null,
      oneFrameBehind: option.oneFrameBehind,
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
      const idleThread = this._getIdleThread();
      if (idleThread) {
        requestAnimationFrame(this._queryFrame);
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
        onStart: () => this._swapCommandBufer(taskId),
      }),
    };
  }

  private _commitFrameData(taskId: number, data: FrameData) {
    const task = this._taskConfig[taskId];
    task.frameData = data;
    if (!this._pendingTasks.has(taskId) || !task.oneFrameBehind) {
      // todo 脏矩形模式下，由于清除的区域和实际不一致，有帧延迟
      this._swapCommandBufer(taskId);
    }
  }

  private _swapCommandBufer(taskId: number) {
    const task = this._taskConfig[taskId];
    if (task.frameData) {
      this._frameDataQueue.unshift(task.frameData);
      this._queryThread()
    }
    task.frameData = null
  }

  private _getUnlockTask(now: number, timeLimit: boolean): number {
    // todo 限流，和上一帧间隔不能太快
    const keys = this._pendingTasks.keys();
    let iter = keys.next();
    while (!iter.done) {
      const taskId = iter.value;
      const taskGlobalCb = this._taskConfig[taskId];
      if (taskGlobalCb && !taskGlobalCb.locked) {
        const lastTime = taskGlobalCb.lastTime;
        if (timeLimit &&  now - lastTime >= 15) {
          return taskId;
        }
        if (!timeLimit && now - lastTime < 15) {
          return taskId;
        }
      }
      iter = keys.next();
    }
  }

  private _queryFrame = () => {
    const pendingTask = this._pendingTasks;
    const now = performance.now();
    const taskId = this._getUnlockTask(now, true);
    if (taskId) {
      const taskGlobalCb = this._taskConfig[taskId];
      taskGlobalCb.locked = true;
      taskGlobalCb.lastTime = now;
      taskGlobalCb.frameCount++;
      const taskCbList = pendingTask.get(taskId);
      pendingTask.delete(taskId);
      taskCbList.forEach(id => {
        this._rafIdCbMap.get(id)(now);
        this._rafIdCbMap.delete(id);
      });
      if (taskGlobalCb.frameCount === 1 && pendingTask.has(taskId) && taskGlobalCb.oneFrameBehind) {
        taskGlobalCb.locked = false;
        requestAnimationFrame(this._queryFrame);
      }
    } else if (this._getUnlockTask(now, false)) {
      requestAnimationFrame(this._queryFrame);
    }
  };

  private _queryThread() {
    const idleThread = this._getIdleThread();
    const frameData = this._frameDataQueue.pop();
    const task = this._taskConfig[1];
    if (idleThread && frameData) {
      idleThread.run(frameData, data => {
        task.locked = false;
        task.onPainted(data);
        this._queryFrame();
        if (this._frameDataQueue.length) {
          this._queryThread();
        }
      });
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
