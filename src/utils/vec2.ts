export type Vec2 = [number, number] | Uint32Array;

// http://glmatrix.net/docs/vec2.js.html

export function transformMat3(out: Vec2, a: Vec2, m: mat3) {
  const x = a[0];
  const y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}

export function dot(a: Vec2, b: Vec2): number {
  return a[0] * b[0] + a[1] * b[1];
}

export function exactEquals(a: Vec2, b: Vec2): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

export function normalize(out: Vec2, a: Vec2) {
  const x = a[0];
  const y = a[1];
  let len = x * x + y * y;
  if (len > 0) {
    // TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }
  out[0] = a[0] * len;
  out[1] = a[1] * len;
  return out;
}