/**
 * @desc smooth line generator wit beziur
 * doc: https://wenku.baidu.com/view/19682071f242336c1eb95e47.html
 */

interface Point {
  x: number;
  y: number;
}
function includePointByMin(p0: Point, p1: Point): Point {
  return {
    x: Math.min(p0.x, p1.x),
    y: Math.min(p0.y, p1.y),
  };
}
function includePointByMax(p0: Point, p1: Point): Point {
  return {
    x: Math.max(p0.x, p1.x),
    y: Math.max(p0.y, p1.y),
  };
}

export default (
  path: Point[],
  isLoop: boolean,
  smoothConstraint?: [Point, Point],
  smoothMonotone?: 'x' | 'y',
): Point[][] => {
  return getBezierList(path, isLoop, smoothConstraint, smoothMonotone);
};

function getRate(P0: Point, P1: Point, P2: Point, first: boolean = false): number {
  return 0.25;
  //   const l1: number = Math.sqrt(Math.pow(P1.x - P0.x, 2) + Math.pow(P1.y - P0.y, 2));
  //   const l2: number = Math.sqrt(Math.pow(P2.x - P1.x, 2) + Math.pow(P2.y - P1.y, 2));

  //   return first ? l1 / (l1 + l2) : l2 / (l1 + l2);
}

function isMonotonicity(P0: Point, P1: Point, P2: Point, key: 'x' | 'y'): boolean {
  return (P0[key] <= P1[key] && P1[key] <= P2[key]) || (P0[key] >= P1[key] && P1[key] >= P2[key]);
}

function getControl(
  P0: Point,
  P1: Point,
  P2: Point,
  P3: Point,
  smoothMonotone?: 'x' | 'y',
): Point[] {
  const rateAX: number =
    smoothMonotone === 'y' && isMonotonicity(P0, P1, P2, 'y') ? 0 : getRate(P0, P1, P2);
  const rateAY: number =
    smoothMonotone === 'x' && isMonotonicity(P0, P1, P2, 'x') ? 0 : getRate(P0, P1, P2);
  const rateBX: number =
    smoothMonotone === 'y' && isMonotonicity(P1, P2, P3, 'y') ? 0 : getRate(P1, P2, P3);
  const rateBY: number =
    smoothMonotone === 'x' && isMonotonicity(P1, P2, P3, 'x') ? 0 : getRate(P1, P2, P3);

  return [
    P1,
    {
      x: P1.x + rateAX * (P2.x - P0.x),
      // x: P1.x + 0 * (P2.x - P0.x),
      y: P1.y + rateAY * (P2.y - P0.y),
      // y: P1.y + 0 * (P2.y - P0.y),
    },
    {
      x: P2.x - rateBX * (P3.x - P1.x),
      // x: P2.x - 0 * (P3.x - P1.x),
      y: P2.y - rateBY * (P3.y - P1.y),
      // y: P2.y - 0 * (P3.y - P1.y),
    },
    P2,
  ];
}

function getBezierList(
  path: Point[],
  isLoop: boolean,
  smoothConstraint?: [Point, Point],
  smoothMonotone?: 'x' | 'y',
): Point[][] {
  const length: number = path.length;
  const outPath: Point[][] = [];
  // let min: number = path[0].y;
  // let max: number = path[0].y;
  let min: Point;
  let max: Point;
  // for (let j: number = 0; j < path.length; j = j + 1) {
  //     const i: Point = path[j];
  //     if (i.y > max) {
  //         max = i.y;
  //     }
  //     if (i.y < min) {
  //         min= i.y;
  //     }
  // }

  if (smoothConstraint) {
    // min = smoothConstraint[0];
    // max = smoothConstraint[1];
    min = { x: Infinity, y: Infinity };
    max = { x: -Infinity, y: -Infinity };
    for (let j: number = 1; j < path.length; j += 1) {
      const i: Point = path[j];
      min = includePointByMin(i, min);
      max = includePointByMax(i, max);
    }

    min = includePointByMin(min, smoothConstraint[0]);
    max = includePointByMax(max, smoothConstraint[1]);
  }
  const maxL: number = isLoop ? length : length - 1;

  for (let i: number = 0; i < maxL; i += 1) {
    let controlP: Point[];
    if (!isLoop) {
      controlP = getControl(
        path[Math.max(0, i - 1)], // safe array steps
        path[i],
        path[Math.min(i + 1, length - 1)], // safe Array steps
        path[Math.min(i + 2, length - 1)], // safe Array steps
        smoothMonotone,
      );
    } else {
      controlP = getControl(
        path[(i - 1 + length) % length], // safe array steps
        path[i],
        path[(i + 1) % length], // safe array steps
        path[(i + 2) % length], // safe array steps
        smoothMonotone,
      );
    }

    for (let t: number = 0; t < controlP.length; t += 1) {
      let j: Point = controlP[t];
      if (smoothConstraint) {
        j = includePointByMax(j, min);
        j = includePointByMin(j, max);
        controlP[t] = j;
      }
      // if (j.y < min) {
      //     j.y = min;
      // }
      // if (j.y > max) {
      //     j.y = max;
      // }
    }

    outPath.push(controlP); // store each value
  }

  return outPath;
}
