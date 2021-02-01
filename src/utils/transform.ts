import * as mat3 from '../../js/mat3';

/**
 * 
 * @param matrix mat3
 * @param angle 旋转弧度
 * @param originX 
 * @param originY 
 */

export function rotate(matrix: mat3, angle = 0,  originX = 0, originY = 0): mat3 {
  const vec2: [number, number] = [originX, originY];
  vec2[0] = originX;
  vec2[1] = originY;
  mat3.translate(matrix, matrix, vec2);
  mat3.rotate(matrix, matrix, angle);
  vec2[0] = -originX;
  vec2[1] = -originY;
  mat3.translate(matrix,matrix, vec2);
  return matrix;
}

export function scale(matrix: mat3, sx = 1, sy = 1, originX = 0, originY = 0) {
  const vec2: [number, number] = [originX, originY];
  mat3.translate(matrix, matrix, vec2);
  mat3.scale(matrix,matrix, [sx, sy]);
  vec2[0] = -originX;
  vec2[1] = -originY;
  mat3.translate(matrix,matrix, vec2);
  return matrix;
}