
import Path2D from '../geometry/Path2D';

export function interpolateNumber(from: number, to: number, k: number): number {
  return from + (to - from) * k;
}

// export function interpolateArray(from: number[], to: number[], k: number): number[] {
//   // todo
// }

// export function interpolateColor(from: Color, to: Color, k: number): Color {
// // todo
// }

// export function interpolatePath(fromPath: Path2D, toPath: Path2D, k: number): Path2D {
// // todo
// }

export function interpolateAttr(from: any, to: any, k: number):any {
  const ret = {} as any;
  // eslint-disable-next-line guard-for-in
  for(const key in from) {
    const fromValue = from[key];
    const toValue = to[key];
    if (typeof fromValue === 'number' && typeof toValue === 'number') {
      ret[key] = interpolateNumber(fromValue, toValue, k);
    }
  }
  return ret;
}