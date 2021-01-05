
export const PI2 = Math.PI * 2;
export function equalWithTolerance(a: number, b: number, tolerance: number = 1e-6) {
  if (tolerance === 0) {
    return a === b;
  }
  return Math.abs(a - b) < tolerance
}

/**
 * 
 * @param cx 
 * @param cy 
 * @param r 
 * @param angle 弧度制 
 */
export function getPointOnPolar(cx: number, cy: number, r: number, angle: number): {x: number; y: number} {
  return {
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
  };
}