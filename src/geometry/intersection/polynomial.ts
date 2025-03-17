// copy from https://github.com/w8r/bezier-intersect/blob/master/src/polynomial.js

const POLYNOMIAL_TOLERANCE = 1e-6;
const TOLERANCE = 1e-12;

export function getPolynomialRoots(p0: number, p1: number, p2: number, p3: number) {
  var C = [p0, p1, p2, p3];
  var degree = C.length - 1;
  var n = degree;
  var results: number[] = [];
  for (var i = 0; i <= degree; i++) {
    if (Math.abs(C[i]) <= TOLERANCE) degree--;
    else break;
  }

  switch (degree) {
    case 1:
      getLinearRoots(C[n], C[n - 1], results);
      break;
    case 2:
      getQuadraticRoots(C[n], C[n - 1], C[n - 2], results);
      break;
    case 3:
      getCubicRoots(C[n], C[n - 1], C[n - 2], C[n - 3], results);
      break;
    default:
      break;
  }

  return results;
}

export function getLinearRoots(C0: number, C1: number, results: number[] = []) {
  if (C1 !== 0) results.push(-C0 / C1);
  return results;
}

export function getQuadraticRoots(C0: number, C1: number, C2: number, results: number[] = []) {
  var a = C2;
  var b = C1 / a;
  var c = C0 / a;
  var d = b * b - 4 * c;

  if (d > 0) {
    var e = Math.sqrt(d);

    results.push(0.5 * (-b + e));
    results.push(0.5 * (-b - e));
  } else if (d === 0) {
    results.push(0.5 * -b);
  }

  return results;
}

export function getCubicRoots(
  C0: number,
  C1: number,
  C2: number,
  C3: number,
  results: number[] = [],
) {
  var c3 = C3;
  var c2 = C2 / c3;
  var c1 = C1 / c3;
  var c0 = C0 / c3;

  var a = (3 * c1 - c2 * c2) / 3;
  var b = (2 * c2 * c2 * c2 - 9 * c1 * c2 + 27 * c0) / 27;
  var offset = c2 / 3;
  var discrim = (b * b) / 4 + (a * a * a) / 27;
  var halfB = b / 2;
  var tmp, root;

  if (Math.abs(discrim) <= POLYNOMIAL_TOLERANCE) discrim = 0;

  if (discrim > 0) {
    var e = Math.sqrt(discrim);

    tmp = -halfB + e;
    if (tmp >= 0) root = Math.pow(tmp, 1 / 3);
    else root = -Math.pow(-tmp, 1 / 3);

    tmp = -halfB - e;
    if (tmp >= 0) root += Math.pow(tmp, 1 / 3);
    else root -= Math.pow(-tmp, 1 / 3);

    results.push(root - offset);
  } else if (discrim < 0) {
    var distance = Math.sqrt(-a / 3);
    var angle = Math.atan2(Math.sqrt(-discrim), -halfB) / 3;
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var sqrt3 = Math.sqrt(3);

    results.push(2 * distance * cos - offset);
    results.push(-distance * (cos + sqrt3 * sin) - offset);
    results.push(-distance * (cos - sqrt3 * sin) - offset);
  } else {
    if (halfB >= 0) tmp = -Math.pow(halfB, 1 / 3);
    else tmp = Math.pow(-halfB, 1 / 3);

    results.push(2 * tmp - offset);
    // really should return next root twice, but we return only one
    results.push(-tmp - offset);
  }

  return results;
}
