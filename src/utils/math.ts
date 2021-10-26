import { isNumber } from './lodash';

export const PI2 = Math.PI * 2;
export function equalWithTolerance(a: number, b: number, tolerance: number = 1e-6) {
  return Math.abs(a - b) <= tolerance
}

/**
 * 
 * @param cx 
 * @param cy 
 * @param r 
 * @param angle rad 
 */
export function getPointOnPolar(cx: number, cy: number, r: number, angle: number): {x: number; y: number} {
  return {
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
  };
}

export function normalizeAngle(angle: number): number {
  let rad = angle % PI2;
  rad =  rad < 0 ? rad + PI2 : rad;
  return rad;
}

 export function getPercentOrNumberValue(
  percentOrNumber: string | number,
  fullValue: number,
): number {
  return isNumber(percentOrNumber)
    ? percentOrNumber
    : (fullValue * parseInt(percentOrNumber, 10)) / 100;
}