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
  orient?: string | number;
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
      orient: 'auto'
    }
  }

  public renderMarker(painter: CanvasPainter, parent: Shape, position: string) {
    const path = parent.getPathData();
    let percent = 0;
    if (position === 'start') {
      return 0;
    } else if (position === 'middle') {
      return 0.5;
    } else if (position === 'end') {
      return 1;
    }
    const point = path.getPointAtPercent(1);
    const ctx = painter.getContext();
    ctx.save();
    painter.drawElement(ctx, this.attr.shape);
    ctx.restore();
  }

  public getSvgAttributes(): any {
    return {
      
    }
  }  
}