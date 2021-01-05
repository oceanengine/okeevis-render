
export const PI2 = Math.PI * 2;
export function equalWithTolerance(a: number, b: number, tolerance: number = 1e-6) {
  if (tolerance === 0) {
    return a === b;
  }
  return Math.abs(a - b) < tolerance
}