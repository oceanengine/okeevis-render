
export const PI2 = Math.PI * 2;
export function equalWithTolerance(a: number, b: number, tolerance: number = 1e-6) {
  return Math.abs(a - b) <= tolerance
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

/**
 * 将角度统一处理,方便判断,避免负数场景
 * @param deg  angle in rad
 * @return angle in [0, Math.PI * 2)
 */
export function normalizeAngle(angle: number): number {
  let rad = angle % PI2;
  rad =  rad < 0 ? rad + PI2 : rad;
  return rad;
}