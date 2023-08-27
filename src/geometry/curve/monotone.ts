// source code from d3-shape https://github.com/d3/d3-shape/blob/main/src/curve/monotone.js
import type { Curve } from '../../abstract/Curve';

function sign(x: number): number {
  return x < 0 ? -1 : 1;
}

// Calculate the slopes of the tangents (Hermite-type interpolation) based on
// the following paper: Steffen, M. 1990. A Simple Method for Monotonic
// Interpolation in One Dimension. Astronomy and Astrophysics, Vol. 239, NO.
// NOV(II), P. 443, 1990.
function slope3(that: MonotoneX, x2: number, y2: number) {
  var h0 = that._x1 - that._x0,
    h1 = x2 - that._x1,
    s0 = (that._y1 - that._y0) / (h0 || (h1 < 0 && -0)),
    s1 = (y2 - that._y1) / (h1 || (h0 < 0 && -0)),
    p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}

// Calculate a one-sided slope.
function slope2(that: MonotoneX, t: number) {
  var h = that._x1 - that._x0;
  return h ? ((3 * (that._y1 - that._y0)) / h - t) / 2 : t;
}

// According to https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Representations
// "you can express cubic Hermite interpolation in terms of cubic Bézier curves
// with respect to the four values p0, p0 + m0 / 3, p1 - m1 / 3, p1".
function point(that: MonotoneX, t0: number, t1: number) {
  var x0 = that._x0,
    y0 = that._y0,
    x1 = that._x1,
    y1 = that._y1,
    dx = (x1 - x0) / 3;
  that._context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1);
}

export class MonotoneX implements Curve {
  public _context: CanvasRenderingContext2D;
  public _line: number;
  public _x0: number;
  public _y0: number;
  public _x1: number;
  public _y1: number;
  public _t0: number;
  public _point: number;
  constructor(context: CanvasRenderingContext2D) {
    this._context = context;
  }

  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN;
    this._point = 0;
  }
  lineEnd() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
      case 3:
        point(this, this._t0, slope2(this, this._t0));
        break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  }
  point(x: number, y: number) {
    var t1 = NaN;

    (x = +x), (y = +y);
    if (x === this._x1 && y === this._y1) return; // Ignore coincident points.
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        point(this, slope2(this, (t1 = slope3(this, x, y))), t1);
        break;
      default:
        point(this, this._t0, (t1 = slope3(this, x, y)));
        break;
    }

    (this._x0 = this._x1), (this._x1 = x);
    (this._y0 = this._y1), (this._y1 = y);
    this._t0 = t1;
  }
}

export class MonotoneY extends MonotoneX {
  point(x: number, y: number) {
    super.point(y, x);
  }
}
