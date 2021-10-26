import { getPointOnPolar } from './math';

export default class Point {
  public x: number;

  public y: number;

  public static fromPolar(cx: number, cy: number, r: number, angle: number) {
    const { x, y } = getPointOnPolar(cx, cy, r, angle);
    return new Point(x, y);
  }

  public constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public clone() {
    return new Point(this.x, this.y);
  }

  public moveTo(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  public moveBy(dx: number, dy: number): this {
    this.x += dx;
    this.y += dy;
    return this;
  }

  /**
   *
   * @param angle rad
   * @param distance  number
   */
  public angleMoveTo(angle: number, distance: number): this {
    return this.moveBy(distance * Math.cos(angle), distance * Math.sin(angle));
  }

  public distanceTo(x: number, y: number): number {
    return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
  }

  public getAngleFrom(x: number, y: number): number {
    return Math.atan2(this.y - y, this.x - x);
  }

  public getAngleTo(x: number, y: number): number {
    return Math.atan2(y - this.y, x - this.x);
  }

  /**
   *
   * @param angle rad
   * @param cx
   * @param cy
   */
  public rotate(angle: number, cx = 0, cy = 0) {
    const curAngle = this.getAngleFrom(cx, cy);
    const newAngle = curAngle + angle;
    const distance = this.distanceTo(cx, cy);
    this.x = cx + distance * Math.cos(newAngle);
    this.y = cy + distance * Math.sin(newAngle);
    return this;
  }

  public scale(scale = 1, cx = 0, cy = 0) {
    const angle = this.getAngleFrom(cx, cy);
    const distance = this.distanceTo(cx, cy);
    this.x = cx + scale * distance * Math.cos(angle);
    this.y = cy + scale * distance * Math.sin(angle);
    return this;
  }
}
