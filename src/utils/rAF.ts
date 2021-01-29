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

export const requestAnimationFrame = windowAnimationFrame
  ? windowAnimationFrame.bind(window)
  : timerRaf;

export const cancelAnimationFrame = windowCancelAnimationFrame
  ? windowCancelAnimationFrame.bind(window)
  : timerCaf;

function timerRaf(callback: Function): number {
  const currTime = new Date().getTime();
  const timeToCall = Math.max(0, 16 - (currTime - lastTime));
  const id = window.setTimeout(function () {
    callback(currTime + timeToCall);
  }, timeToCall);
  lastTime = currTime + timeToCall;
  return id;
}

function timerCaf(id: number) {
  clearTimeout(id);
}
