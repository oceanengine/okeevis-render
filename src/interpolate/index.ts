
import Path2D from '../geometry/Path2D';

export function interpolateNumber(from: number, to: number, k: number): number {
  return from + (to - from) * k;
}

export function interpolateArray(from: number[], to: number[], k: number): number[] {
  // todo
}

export function interpolateColor(from: Color, to: Color, k: number): Color {
// todo
}

export function interpolatePath(fromPath: Path2D, toPath: Path2D, k: number): Path2D {
// todo
}