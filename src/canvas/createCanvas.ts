export type CanvasCreator = (width: number, height: number) => HTMLCanvasElement;

let canvasCreator: CanvasCreator = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export function getCanvasCreator(): CanvasCreator {
  return canvasCreator;
}

export function setCanvasCreator(creator: CanvasCreator) {
  canvasCreator = creator;
}
