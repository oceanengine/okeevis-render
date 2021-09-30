import Element, { CommonAttr } from './Element';
import Shape from './Shape';
import { BBox } from '../utils/bbox';
import CanvasPainter from '../painter/CanvasPainter';
import * as mat3 from '../../js/mat3';

// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/orient
export interface MarkerAttr extends CommonAttr {
  shape?: Shape;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  orient?: 'auto' | 'auto-start-reverse' | number;
}

export type MarkerPosition = 'start' | 'end' | 'middle';


export default class Marker extends Element<MarkerAttr> {
  public type = 'marker';

  public svgTagName = 'marker';

  public getDefaultAttr(): MarkerAttr {
    return {
      x: 0,
      y: 0,
      width: 3,
      height: 3,
      orient: 0,
    } as MarkerAttr
  }

  public renderMarker(painter: CanvasPainter, parent: Shape, position: MarkerPosition) {
    const matrix = this._getMarkerMatrix(parent, position);
    const ctx = painter.getContext();
    ctx.save();
    ctx.transform(
      matrix[0],
      matrix[1],
      matrix[3],
      matrix[4],
      matrix[6],
      matrix[7],
    );
    painter.drawElement(ctx, this.attr.shape);
    ctx.restore();
  }

  public getMarkerDirtyRect(parent: Shape, position: MarkerPosition): BBox {
    const matrix = this._getMarkerMatrix(parent, position);
    const { x, y, width, height } = this.attr.shape.getCurrentDirtyRect();
    const out = {x: 0, y :0, width: 0, height: 0};
    return this.computeBBoxWithTransform(out, x, y, width, height, matrix);
  }

  public getSvgAttributes(): any {
    const { x, y, width, height, shape } = this.attr;
    return {
      id: `lightcharts-marker-${this.id}`,
      refX: x,
      refY: y,
      markerWidth: width,
      markerHeight: height,
      children: [shape],
    }
  }

  private _getMarkerMatrix(parent: Shape, position: MarkerPosition): mat3 {
    const out = mat3.create();
    const path = parent.getPathData();
    const { x, y, width, height, orient, shape } = this.attr;
    const bbox = shape.getBBox();
    const sx = width / bbox.width;
    const sy = height / bbox.height;
    let rotate = orient;
    let percent = 0;
    if (position === 'start') {
      percent = 0
    } else if (position === 'middle') {
      percent = 0.5;
    } else if (position === 'end') {
      percent = 1;
    }
    const point = path.getPointAtPercent(percent);
    if (orient === 'auto' || orient === 'auto-start-reverse') {
      rotate = Math.atan(point.alpha);
    }
    if (orient === 'auto-start-reverse' && position === 'start') {
      rotate = Math.atan(point.alpha) - Math.PI;
    }
    mat3.translate(out, out, [point.x, point.y]);

    if (rotate !== 0) {
      mat3.rotate(out, out, -rotate);
    }
    mat3.scale(out, out, [sx, sy]);
    mat3.translate(out, out, [-bbox.width / 2, (position === 'middle' || typeof orient === 'number') ? -bbox.height / 2 : 0])
    return out;
  }
}