/**
 * @desc requestAnimationFrame
 */
// import { requestAnimationFrameHack } from '@/animation/scedular';

let lastTime = 0;

export const requestAnimationFrame =
  (typeof window !== 'undefined' &&
    (window.msRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.requestAnimationFrame)) ||
  timerRaf;

export const cancelAnimationFrame =
  (typeof window !== 'undefined' &&
    (window.msCancelAnimationFrame ||
      window.mozCancelAnimationFrame ||
      window.oCancelAnimationFrame ||
      window.cancelAnimationFrame)) ||
  timerCaf;

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
