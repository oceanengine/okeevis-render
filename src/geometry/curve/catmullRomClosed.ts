import { point } from './catmullRom';

function noop() {}

export class CatmullRomClosed {
  public _context: CanvasRenderingContext2D;
  public _line: number;
  public _x0: number;
  public _y0: number;
  public _x1: number;
  public _y1: number;
  public _x2: number;
  public _y2: number;
  public _x3: number;
  public _y3: number;
  public _x4: number;
  public _y4: number;
  public _x5: number;
  public _y5: number;
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

  areaStart = noop;
  areaEnd = noop;
  lineStart() {
    this._x0 =
      this._x1 =
      this._x2 =
      this._x3 =
      this._x4 =
      this._x5 =
      this._y0 =
      this._y1 =
      this._y2 =
      this._y3 =
      this._y4 =
      this._y5 =
        NaN;
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
      case 1: {
        this._context.moveTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        this.point(this._x5, this._y5);
        break;
      }
    }
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
        (this._x3 = x), (this._y3 = y);
        break;
      case 1:
        this._point = 2;
        this._context.moveTo((this._x4 = x), (this._y4 = y));
        break;
      case 2:
        this._point = 3;
        (this._x5 = x), (this._y5 = y);
        break;
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
