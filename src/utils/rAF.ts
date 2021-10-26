/**
 * @desc requestAnimationFrame
 */

let lastTime = 0;

const windowAnimationFrame =
  typeof window !== 'undefined' &&
  (window.requestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame);

const windowCancelAnimationFrame =
  typeof window !== 'undefined' &&
  (window.cancelAnimationFrame ||
    window.msCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.oCancelAnimationFrame);

let requestAnimationFrame = windowAnimationFrame ? windowAnimationFrame.bind(window) : timerRaf;

let cancelAnimationFrame = windowCancelAnimationFrame
  ? windowCancelAnimationFrame.bind(window)
  : timerCaf;

export function setRequestAnimationFrame(raf: Function) {
  requestAnimationFrame = raf;
}

export function setCancelAnimationFrame(cancelRaf: Function) {
  cancelAnimationFrame = cancelRaf;
}

export function getRequestAnimationFrame(): Function {
  return requestAnimationFrame;
}

export function getCancelAnimationFrame(): Function {
  return cancelAnimationFrame;
}

function timerRaf(callback: Function): number {
  const currTime = new Date().getTime();
  const timeToCall = Math.max(0, 16 - (currTime - lastTime));
  const id = setTimeout(function () {
    callback(currTime + timeToCall);
  }, timeToCall);
  lastTime = currTime + timeToCall;
  return id as any;
}

function timerCaf(id: number) {
  clearTimeout(id);
}
