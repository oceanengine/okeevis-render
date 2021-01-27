/**
 * @desc Splines, Catmull-Rom algorithm for smooth movement
 * wiki: http://www.dxstudio.com/guide_content.aspx?id=70a2b2cf-193e-4019-859c-28210b1da81f
 * for get smooth line points
 */

interface Point {
  x: number;
  y: number;
}
export default (path: Point[], isLoop: boolean = false, frame: number): Point[] => {
  return savePathCatmullRom(path, isLoop, frame);
};

function interpolatedPosition(P0: Point, P1: Point, P2: Point, P3: Point, u: number): Point {
  // exp: Catmull-Rom interpolation

  const u3: number = u * u * u;

  const u2: number = u * u;

  const f1: number = u3 * -0.5 + u2 - u * 0.5;

  const f2: number = u3 * 1.5 - u2 * 2.5 + 1;

  const f3: number = u3 * -1.5 + u2 * 2 + u * 0.5;

  const f4: number = u3 * 0.5 - u2 * 0.5;

  const x: number = P0.x * f1 + P1.x * f2 + P2.x * f3 + P3.x * f4;

  const y: number = P0.y * f1 + P1.y * f2 + P2.y * f3 + P3.y * f4;

  return {x, y};
}

let nodesLeft: number = 0;

// main function to calculate the Path
function savePathCatmullRom(path: Point[], isLoop: boolean, frame: number): Point[] {
  if (!path) {
    return;
  }

  const length: number = path.length;
  const outPath: Point[] = [];
  const max: number = isLoop ? length : length - 1;

  for (let i: number = 0; i < max; i += 1) {
    // var ui = 0;

    for (let u: number = 0; u < 1; u += 1 / frame) {
      // var vec = new Vector();
      let vec: Point;

      if (!isLoop) {
        vec = interpolatedPosition(
          // call to Catmull-Rom
          path[Math.max(0, i - 1)], // safe array steps
          path[i],
          path[Math.min(i + 1, length - 1)], // safe Array steps
          path[Math.min(i + 2, length - 1)], // safe Array steps
          u,
        );
      } else {
        vec = interpolatedPosition(
          // call to Catmull-Rom
          path[(i - 1 + length) % length], // safe array steps
          path[i],
          path[(i + 1) % length], // safe array steps
          path[(i + 2) % length], // safe array steps
          u,
        );
      }

      outPath.push(vec); // store each value
      nodesLeft += 1; // increment node counter
      // ui++;
    }
  }

  return outPath;
}
