declare module 'normalize-wheel' {
  export interface NormalLizeWheel {
    spinX: number;
    spinY: number;
    pixelX: number;
    pixelY: number;
  }
  const fn =  (event: WheelEvent) => NormalLizeWheel;
  export = fn;
}
declare module 'lodash/_root'