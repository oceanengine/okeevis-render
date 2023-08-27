// source code https://github.com/d3/d3-shape/blob/main/src/curve/basis.js
import type { Curve } from '../../abstract/Curve';

export function point(that: Basis, x: number, y: number) {
  that._context.bezierCurveTo(
    (2 * that._x0 + that._x1) / 3,
    (2 * that._y0 + that._y1) / 3,
    (that._x0 + 2 * that._x1) / 3,
    (that._y0 + 2 * that._y1) / 3,
    (that._x0 + 4 * that._x1 + x) / 6,
    (that._y0 + 4 * that._y1 + y) / 6,
  );
}

export class Basis implements Curve {
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
    this._x0 = this._x1 = this._y0 = this._y1 = NaN;
    this._point = 0;
  }
  lineEnd() {
    switch (this._point) {
      case 3:
        point(this, this._x1, this._y1); // falls through
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  }
  point(x: number, y: number) {
    (x = +x), (y = +y);
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
        this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6); // falls through
      default:
        point(this, x, y);
        break;
    }
    (this._x0 = this._x1), (this._x1 = x);
    (this._y0 = this._y1), (this._y1 = y);
  }
}
