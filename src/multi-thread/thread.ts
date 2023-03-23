import { FrameData } from './command-buffer';
import {
  MessageExecuteBuffer,
  MessageWorkerFrame,
} from './types';
import { worker } from './worker-build';

let id = 1;
export class Thread {
  private _worker: Worker;

  private _isIdle: boolean = true;

  private _callback: (data: ImageBitmap) => void;

  private _id: number;

  private _loadedImage: Set<number> = new Set();

  private _startTime: number;

  public constructor() {
    this._id = id++;
    const blob = new Blob([worker]);
    const url = URL.createObjectURL(blob);
    this._worker = new Worker(url, {name: 'okee-canvas-worker' + this._id});
    this._worker.onmessage = this._handleMessage;
  }

  public onStart() {
    this._startTime = performance.now();
  }

  public run(data: FrameData, onEnd: (image: ImageBitmap) => void) {
    const { buffers , images, } = data;
    this._isIdle = false;
    this._callback = onEnd;
    const postImages: ImageBitmap[] = [];
    const imageIds: number[] = [];
    images.forEach((image, id) => {
      if (!this._loadedImage.has(id)) {
        this._loadedImage.add(id);
        const canvas = new OffscreenCanvas(image.width, image.height);
        canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
        postImages.push(canvas.transferToImageBitmap());
        imageIds.push(id);
      }
    });
    this.postMessage<MessageExecuteBuffer>({
      type: 'execute',
      buffers: data.buffers,
      images: postImages,
      imageIds,
    }, [...buffers, ...postImages]);
  }

  public postMessage<T extends {type: string}>(message: T, transfer?: Transferable[]) {
    this._worker.postMessage(message, transfer);
  }

  public isIdle() {
    return this._isIdle;
  }

  public dispose() {}

  private _handleMessage = (event: { data: any }) => {
    const data = event.data as MessageWorkerFrame;
    if (data.type === 'frame') {
      this._onEnd(data.canvas);
    }
  };

  private _onEnd(data: ImageBitmap) {
    this._isIdle = true;
    this._callback(data);
    // this._callback = undefined;
  }
}
