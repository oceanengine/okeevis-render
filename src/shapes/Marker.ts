import Element, { CommonAttr } from './Element';
import Shape from './Shape';
import CanvasPainter from '../painter/CanvasPainter';

// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/orient
export interface MarkerAttr extends CommonAttr {
  shape?: Shape;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  orient?: 'auto' | 'auto-start-reverse' | number;
}


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

  public renderMarker(painter: CanvasPainter, parent: Shape, position: string) {
    const path = parent.getPathData();
    const {x, y, width, height, orient, shape } = this.attr;
    const bbox = shape.getBBox();
    const sx = width / bbox.width;
    const sy = height / bbox.height;
    let rotate = orient;
    let percent = 0;
    if (position === 'start') {
      percent = 0
    } else if (position === 'middle') {
      percent =  0.5;
    } else if (position === 'end') {
      percent = 1;
    }
    const point = path.getPointAtPercent(1);
    if (rotate === 'auto' || position !== 'start') {
      rotate = Math.atan(point.alpha);
    }
    if (rotate === 'auto-start-reverse' && position === 'start') {
      rotate = Math.atan(point.alpha) - Math.PI;
    }
    const ctx = painter.getContext();
    ctx.save();
    ctx.translate(point.x, point.y);
    if (orient !== 0) {
      ctx.rotate(rotate as number);
    }
    ctx.scale(sx, sy);
    ctx.translate(x, y);
    painter.drawElement(ctx,shape);
    ctx.restore();
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
}