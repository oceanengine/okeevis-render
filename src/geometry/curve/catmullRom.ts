
export const epsilon = 1e-12;

export function point(that: CatmullRom, x: number, y: number) {
  var x1 = that._x1,
    y1 = that._y1,
    x2 = that._x2,
    y2 = that._y2;

  if (that._l01_a > epsilon) {
    var a = 2 * that._l01_2a + 3 * that._l01_a * that._l12_a + that._l12_2a,
      n = 3 * that._l01_a * (that._l01_a + that._l12_a);
    x1 = (x1 * a - that._x0 * that._l12_2a + that._x2 * that._l01_2a) / n;
    y1 = (y1 * a - that._y0 * that._l12_2a + that._y2 * that._l01_2a) / n;
  }

  if (that._l23_a > epsilon) {
    var b = 2 * that._l23_2a + 3 * that._l23_a * that._l12_a + that._l12_2a,
      m = 3 * that._l23_a * (that._l23_a + that._l12_a);
    x2 = (x2 * b + that._x1 * that._l23_2a - x * that._l12_2a) / m;
    y2 = (y2 * b + that._y1 * that._l23_2a - y * that._l12_2a) / m;
  }

  that._context.bezierCurveTo(x1, y1, x2, y2, that._x2, that._y2);
}

export class CatmullRom {
  public _context: CanvasRenderingContext2D;
  public _line: number;
  public _x0: number;
  public _y0: number;
  public _x1: number;
  public _y1: number;
  public _x2: number;
  public _y2: number;
  public _alpha: number;
  public _point: number;
  public _l01_a: number;
  public _l01_2a: number;
  public _l12_a: number;
  public _l12_2a: number;
  public _l23_a: number;
  public _l23_2a: number;

  constructor(context: CanvasRenderingContext2D, alpha: number = 0.5) {
    this._context = context;
    this._alpha = alpha;
  }
  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._l01_a =
      this._l12_a =
      this._l23_a =
      this._l01_2a =
      this._l12_2a =
      this._l23_2a =
      this._point =
        0;
  }
  lineEnd() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x2, this._y2);
        break;
      case 3:
        this.point(this._x2, this._y2);
        break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  }
  point(x: number, y: number) {
    (x = +x), (y = +y);

    if (this._point) {
      var x23 = this._x2 - x,
        y23 = this._y2 - y;
      this._l23_a = Math.sqrt((this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha)));
    }

    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3; // falls through
      default:
        point(this, x, y);
        break;
    }

    (this._l01_a = this._l12_a), (this._l12_a = this._l23_a);
    (this._l01_2a = this._l12_2a), (this._l12_2a = this._l23_2a);
    (this._x0 = this._x1), (this._x1 = this._x2), (this._x2 = x);
    (this._y0 = this._y1), (this._y1 = this._y2), (this._y2 = y);
  }
}
