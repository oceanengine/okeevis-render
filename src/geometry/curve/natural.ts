import type { Curve } from '../../abstract/Curve';

export class Natural implements Curve
  { public _context: CanvasRenderingContext2D;
    public _line: number;
    public _x: number[];
    public _y: number[];
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
      this._x = [];
      this._y = [];
    }
    lineEnd() {
      var x = this._x,
          y = this._y,
          n = x.length;
  
      if (n) {
        this._line ? this._context.lineTo(x[0], y[0]) : this._context.moveTo(x[0], y[0]);
        if (n === 2) {
          this._context.lineTo(x[1], y[1]);
        } else {
          var px = controlPoints(x),
              py = controlPoints(y);
          for (var i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) {
            this._context.bezierCurveTo(px[0][i0], py[0][i0], px[1][i0], py[1][i0], x[i1], y[i1]);
          }
        }
      }
  
      if (this._line || (this._line !== 0 && n === 1)) this._context.closePath();
      this._line = 1 - this._line;
      this._x = this._y = null;
    }
    point(x: number, y: number) {
      this._x.push(+x);
      this._y.push(+y);
    }
  };
  
  // See https://www.particleincell.com/2012/bezier-splines/ for derivation.
  function controlPoints(x: number[]) {
    var i,
        n = x.length - 1,
        m,
        a = new Array(n),
        b = new Array(n),
        r = new Array(n);
    a[0] = 0, b[0] = 2, r[0] = x[0] + 2 * x[1];
    for (i = 1; i < n - 1; ++i) a[i] = 1, b[i] = 4, r[i] = 4 * x[i] + 2 * x[i + 1];
    a[n - 1] = 2, b[n - 1] = 7, r[n - 1] = 8 * x[n - 1] + x[n];
    for (i = 1; i < n; ++i) m = a[i] / b[i - 1], b[i] -= m, r[i] -= m * r[i - 1];
    a[n - 1] = r[n - 1] / b[n - 1];
    for (i = n - 2; i >= 0; --i) a[i] = (r[i] - a[i + 1]) / b[i];
    b[n - 1] = (x[n] + a[n - 1]) / 2;
    for (i = 0; i < n - 1; ++i) b[i] = 2 * x[i + 1] - a[i + 1];
    return [a, b];
  }
