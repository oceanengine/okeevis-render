
export type Vec2 = [number, number];

// http://glmatrix.net/docs/vec2.js.html
export function transformMat3(out: Vec2 , a: Vec2, m: mat3) {
  const x = a[0];
  const y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}