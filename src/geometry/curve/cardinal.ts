import { Curve } from "../../abstract/Curve";

export function point(that: Cardinal, x: number, y: number) {
  that._context.bezierCurveTo(
    that._x1 + that._k * (that._x2 - that._x0),
    that._y1 + that._k * (that._y2 - that._y0),
    that._x2 + that._k * (that._x1 - x),
    that._y2 + that._k * (that._y1 - y),
    that._x2,
    that._y2,
  );
}

export class Cardinal implements Curve {
  public _context: CanvasRenderingContext2D;
  public _line: number;
  public _x: number[];
  public _y: number[];
  public _x0: number;
  public _y0: number;
  public _x1: number;
  public _y1: number;
  public _t0: number;
  public _x2: number;
  public _y2: number;
  public _point: number;
  public _k: number;
  constructor(context: CanvasRenderingContext2D, tension: number) {
    this._context = context;
    this._k = (1 - tension) / 6;
  }
  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._point = 0;
  }
  lineEnd() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x2, this._y2);
        break;
      case 3:
        point(this, this._x1, this._y1);
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
        (this._x1 = x), (this._y1 = y);
        break;
      case 2:
        this._point = 3; // falls through
      default:
        point(this, x, y);
        break;
    }
    (this._x0 = this._x1), (this._x1 = this._x2), (this._x2 = x);
    (this._y0 = this._y1), (this._y1 = this._y2), (this._y2 = y);
  }
}
