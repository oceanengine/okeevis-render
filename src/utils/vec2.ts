import { BBox } from './bbox';

export type Vec2 = [number, number];

export function createVec2(): [number, number] {
  let out;
  try {
    if (typeof Float32Array !== 'undefined') {
      out = new Float32Array(2) as any;
    } else {
      out = new Array(2);
    }
  } catch (err) {
    out = new Array(2);
  }
  out[0] = out[1] = 0;
  return out;
}

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

export function cross(a: Vec2, b: Vec2): number {
  return a[0] * b[1] - a[1] * b[0];
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

export function angle(a: Vec2, b: Vec2) {
  const x1 = a[0];
  const y1 = a[1];
  const x2 = b[0];
  const y2 = b[1];
  // mag is the product of the magnitudes of a and b
  const mag = Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2);
  // mag &&.. short circuits if mag == 0
  const cosine = mag && (x1 * x2 + y1 * y2) / mag;
  // Math.min(Math.max(cosine, -1), 1) clamps the cosine between -1 and 1
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}

export function vec2BBox(vectors: [number, number][], out: BBox): BBox {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < vectors.length; i++) {
    minX = Math.min(vectors[i][0], minX);
    maxX = Math.max(vectors[i][0], maxX);
    minY = Math.min(vectors[i][1], minY);
    maxY = Math.max(vectors[i][1], maxY);
  }
  out.x = minX;
  out.y = minY;
  out.width = maxX - minX;
  out.height = maxY - minY;
  return out;
}
