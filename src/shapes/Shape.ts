import { Options as RoughOptions, Drawable } from 'roughjs/bin/core';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import Element, { CommonAttr } from './Element';

import { ArcAttr } from './Arc';
import { CircleAttr } from './Circle';
import { ImageAttr } from './Image';
import { LineAttr } from './Line';
import { PathAttr } from './Path';
import { PolygonAttr } from './Polygon';
import { PolylineAttr } from './Polyline';
import { RectAttr } from './Rect';
import { SectorAttr } from './Sector';
import { TextAttr } from './Text';
import { EllipseAttr } from './Ellipse';
import { CompoundPathAttr } from './CompoundPath';
import Path2D, { PointOnPath } from '../geometry/Path2D';

export type ShapeAttr = ArcAttr &
  CircleAttr &
  ImageAttr &
  LineAttr &
  PathAttr &
  PolylineAttr &
  PolygonAttr &
  RectAttr &
  SectorAttr &
  TextAttr &
  CompoundPathAttr &
  EllipseAttr;

export default class Shape<T extends CommonAttr = ShapeAttr> extends Element<T> {
  public svgTagName = 'path';

  private _roughSeed: number;
  
  public brush(ctx: CanvasRenderingContext2D) {
    ctx;
  }

  public drawRough(roughCanvas: RoughCanvas, options?: RoughOptions) {
    if (this._cacheRough) {
      roughCanvas.draw(this._cacheRough);
      return;
    }
    this._cacheRough = this.createRough(roughCanvas, options);
  }

  protected createRough(roughCanvas: RoughCanvas, options?: RoughOptions): Drawable {
    const path = this.getPathData().getSVGPathString();
    return roughCanvas.path(path, options);
  }

  public getRoughSeed() {
    if (!this._roughSeed) {
      this._roughSeed = Math.floor(Math.random() * Math.pow(2, 31));
    }
    return this._roughSeed;
  }

  public getSvgAttributes(): any {
    const ret = super.getSvgAttributes();
    if ((this.fillAble || this.strokeAble) && this.type !== 'text' && this.type !== 'use') {
      const path = this.getPathData();
      ret.d = path.getSVGPathString();
    }
    return ret;
  }

  public getPathData(): Path2D {
    const path = new Path2D();
    this.brush(path as any);
    return path;
  }

  public isPointInStroke(x: number, y: number, lineWidth: number): boolean {
    return this.getPathData().isPointInStroke(x, y, lineWidth);
  }

  public isPointInFill(x: number, y: number): boolean {
    return this.getPathData().isPointInPath(x, y);
  }

  public getTotalLength(): number {
    return this.getPathData().getTotalLength();
  }

  public getPointAtLength(len: number): PointOnPath {
    return this.getPathData().getPointAtLength(len);
  }

  public getPoint(ration: number): PointOnPath {
    return this.getPathData().getPointAtPercent(ration);
  }
}
