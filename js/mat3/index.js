/* eslint-disable no-var */
export * from 'gl-matrix/mat3';
// add try catch for vite
export function createVec3() {
    var out;
    try {
      if (typeof Float32Array !== 'undefined') {
        out = new Float32Array(9);
      } else {
        out = new Array(9);
      }
    } catch (err) {
      out = new Array(9);
    }
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[0] = 1;
    out[4] = 1;
    out[8] = 1;
    return out;
  };