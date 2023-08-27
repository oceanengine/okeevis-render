// source code https://github.com/d3/d3-shape/blob/main/src/curve/basisClosed.js
import { point } from './basis';

function noop() {}

export class BasisClosed {
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
  public _t0: number;
  public _point: number;
  public areaStart = noop;
  public areaEnd = noop;
  constructor(context: CanvasRenderingContext2D) {
    this._context = context;
  }

  lineStart() {
    this._x0 =
      this._x1 =
      this._x2 =
      this._x3 =
      this._x4 =
      this._y0 =
      this._y1 =
      this._y2 =
      this._y3 =
      this._y4 =
        NaN;
    this._point = 0;
  }
  lineEnd() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x2, this._y2);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3);
        this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x2, this._y2);
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        break;
      }
    }
  }
  point(x: number, y: number) {
    (x = +x), (y = +y);
    switch (this._point) {
      case 0:
        this._point = 1;
        (this._x2 = x), (this._y2 = y);
        break;
      case 1:
        this._point = 2;
        (this._x3 = x), (this._y3 = y);
        break;
      case 2:
        this._point = 3;
        (this._x4 = x), (this._y4 = y);
        this._context.moveTo((this._x0 + 4 * this._x1 + x) / 6, (this._y0 + 4 * this._y1 + y) / 6);
        break;
      default:
        point(this, x, y);
        break;
    }
    (this._x0 = this._x1), (this._x1 = x);
    (this._y0 = this._y1), (this._y1 = y);
  }
}