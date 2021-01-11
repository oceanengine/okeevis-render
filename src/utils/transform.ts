import * as mat3 from '../../js/mat3';

/**
 * 
 * @param matrix mat3
 * @param angle 旋转弧度
 * @param originX 
 * @param originY 
 */
export function rotate(matrix: mat3, angle = 0,  originX = 0, originY = 0): mat3 {
  mat3.translate(matrix, matrix, [originX, originY]);
  mat3.rotate(matrix, matrix, angle);
  mat3.translate(matrix,matrix, [-originX, -originY]);
  return matrix;
}

export function scale(matrix: mat3, sx = 1, sy = 1, originX = 0, originY = 0) {
  mat3.translate(matrix, matrix, [originX, originY]);
  mat3.scale(matrix,matrix, [sx, sy]);
  mat3.translate(matrix,matrix, [-originX, -originY]);
  return matrix;
}