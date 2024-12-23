type CubicNumber = [number, number, number, number];

var S=new Array() /*splines*/
var P =new Array() /*control points*/
var I =new Array() /*intersection points*/

/*computes intersection between a cubic spline and a line segment*/
export function computeIntersections(px: CubicNumber, py: CubicNumber, lx: [number, number], ly: [number, number], out: [number, number][]) {
  var X = Array();

  var A = ly[1] - ly[0]; //A=y2-y1
  var B = lx[0] - lx[1]; //B=x1-x2
  var C = lx[0] * (ly[0] - ly[1]) + ly[0] * (lx[1] - lx[0]); //C=x1*(y1-y2)+y1*(x2-x1)

  var bx = bezierCoeffs(px[0], px[1], px[2], px[3]);
  var by = bezierCoeffs(py[0], py[1], py[2], py[3]);

  var P = Array();
  P[0] = A * bx[0] + B * by[0]; /*t^3*/
  P[1] = A * bx[1] + B * by[1]; /*t^2*/
  P[2] = A * bx[2] + B * by[2]; /*t*/
  P[3] = A * bx[3] + B * by[3] + C; /*1*/

  var r = cubicRoots(P);

  /*verify the roots are in bounds of the linear segment*/
  for (var i = 0; i < 3; i++) {
    var t = r[i];

    X[0] = bx[0] * t * t * t + bx[1] * t * t + bx[2] * t + bx[3];
    X[1] = by[0] * t * t * t + by[1] * t * t + by[2] * t + by[3];

    /*above is intersection point assuming infinitely long line segment,
          make sure we are also in bounds of the line*/
    var s;
    if (lx[1] - lx[0] != 0) /*if not vertical line*/ s = (X[0] - lx[0]) / (lx[1] - lx[0]);
    else s = (X[1] - ly[0]) / (ly[1] - ly[0]);

    /*in bounds?*/
    if (!(t < 0 || t > 1.0 || s < 0 || s > 1.0)) {
      out.push([X[0], X[1]])
    }
  }
}

/*based on http://mysite.verizon.net/res148h4j/javascript/script_exact_cubic.html#the%20source%20code*/
function cubicRoots(P: number[]): number[] {
  var a = P[0];
  var b = P[1];
  var c = P[2];
  var d = P[3];

  var A = b / a;
  var B = c / a;
  var C = d / a;

  var Q: number, R: number, D: number, S: number, T: number, Im: number;

  var Q = (3 * B - Math.pow(A, 2)) / 9;
  var R = (9 * A * B - 27 * C - 2 * Math.pow(A, 3)) / 54;
  var D = Math.pow(Q, 3) + Math.pow(R, 2); // polynomial discriminant

  var t: number[] = Array();

  if (D >= 0) {
    // complex or duplicate roots
    var S = sgn(R + Math.sqrt(D)) * Math.pow(Math.abs(R + Math.sqrt(D)), 1 / 3);
    var T = sgn(R - Math.sqrt(D)) * Math.pow(Math.abs(R - Math.sqrt(D)), 1 / 3);

    t[0] = -A / 3 + (S + T); // real root
    t[1] = -A / 3 - (S + T) / 2; // real part of complex root
    t[2] = -A / 3 - (S + T) / 2; // real part of complex root
    Im = Math.abs((Math.sqrt(3) * (S - T)) / 2); // complex part of root pair

    /*discard complex roots*/
    if (Im != 0) {
      t[1] = -1;
      t[2] = -1;
    }
  } // distinct real roots
  else {
    var th = Math.acos(R / Math.sqrt(-Math.pow(Q, 3)));

    t[0] = 2 * Math.sqrt(-Q) * Math.cos(th / 3) - A / 3;
    t[1] = 2 * Math.sqrt(-Q) * Math.cos((th + 2 * Math.PI) / 3) - A / 3;
    t[2] = 2 * Math.sqrt(-Q) * Math.cos((th + 4 * Math.PI) / 3) - A / 3;
    Im = 0.0;
  }

  /*discard out of spec roots*/
  for (var i = 0; i < 3; i++) if (t[i] < 0 || t[i] > 1.0) t[i] = -1;

  /*sort but place -1 at the end*/
  t = sortSpecial(t);

  return t;
}

function sortSpecial(a: number[]): number[] {
  var flip;
  var temp;

  do {
    flip = false;
    for (var i = 0; i < a.length - 1; i++) {
      if ((a[i + 1] >= 0 && a[i] > a[i + 1]) || (a[i] < 0 && a[i + 1] >= 0)) {
        flip = true;
        temp = a[i];
        a[i] = a[i + 1];
        a[i + 1] = temp;
      }
    }
  } while (flip);
  return a;
}

// sign of number
function sgn(x: number): number {
  if (x < 0.0) return -1;
  return 1;
}

function bezierCoeffs(P0: number, P1: number, P2: number, P3: number): number[] {
  var Z = Array();
  Z[0] = -P0 + 3 * P1 + -3 * P2 + P3;
  Z[1] = 3 * P0 - 6 * P1 + 3 * P2;
  Z[2] = -3 * P0 + 3 * P1;
  Z[3] = P0;
  return Z;
}
