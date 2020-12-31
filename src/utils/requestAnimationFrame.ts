/**
 * @desc requestAnimationFrame
 */
// import { requestAnimationFrameHack } from '@/animation/scedular';

declare global {
  // tslint:disable-next-line:interface-name
  interface Window {
      msRequestAnimationFrame: Function;
      mozRequestAnimationFrame: Function;
  }
}

export default (typeof window !== 'undefined' &&
  ((window.requestAnimationFrame &&
      window.requestAnimationFrame.bind(window)) ||
      (window.msRequestAnimationFrame &&
          window.msRequestAnimationFrame.bind(window)) ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame)) ||
  // tslint:disable-next-line:no-function-expression
  function (func: Function): void {
      setTimeout(func, 16);
  };
