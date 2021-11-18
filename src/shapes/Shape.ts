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

  public brush(ctx: CanvasRenderingContext2D) {
    ctx;
  }

  public getSvgAttributes(): any {
    const ret = super.getSvgAttributes();
    if ((this.fillAble || this.strokeAble) && this.type !== 'text') {
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
