import Painter from '../abstract/Painter';

export type PainterConstructor =  new (...args: any[]) => Painter;

const painters: Record<string, PainterConstructor> = {};

export function registerPainter(type: string, painter: PainterConstructor) {
  painters[type] = painter;
}

export function getPainter(type: string):  PainterConstructor {
  return painters[type];
}
