import { executeCommand, loadImage } from './decode';
import { MessageWorkerFrame, MessageExecuteBuffer } from './types';

const canvas = new OffscreenCanvas(300, 150) as any;

const ctx = canvas.getContext('2d');


onmessage = (evt: MessageEvent) => {
  const { type } = evt.data as MessageExecuteBuffer;
  if (type === 'execute') {
    const { buffers, images, imageIds } = evt.data as MessageExecuteBuffer;
    images.forEach((image, index) => loadImage(imageIds[index], image));
    buffers.forEach(buffer =>  executeCommand(buffer, ctx, canvas));
    const image = canvas.transferToImageBitmap();
    const message: MessageWorkerFrame = { type: 'frame', canvas: image };
    postMessage(message, [image] as any);
  }
};
