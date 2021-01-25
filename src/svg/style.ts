import Element from '../shapes/Element';
import * as mat3 from '../../js/mat3';

const identity_matrix = mat3.create();

export interface SVGElementStyle {
  clip: string;
  fill: string;
  stroke: string;
  'stroke-width': string;
  'stroke-linecap': string;
  'stroke-linjoin': string;
  'stroke-miterlimit': string;
  'stroke-dasharray': string;
  'stroke-dashoffset': string;
  'font-size': string;
  'font-weight': string;
  'font-family': string;
  'font-style': string;
  display: string;
  anchor: string;
  transform: string;
  opacity: string;
  'fill-opacity': string;
  'stroke-opacity': string;
  filter: string;
  cursor: string;
}

export function getSVGStyleAttributes(node: Element): Partial<SVGElementStyle> {
  const {
    fill,
    stroke,
    lineWidth,
    opacity,
    fillOpacity,
    strokeOpacity,
    cursor,
    display,
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
  } = node.attr;
  const ret: Partial<SVGElementStyle> = {};
  const matrix = node.getGlobalTransform();

  if (!mat3.exactEquals(matrix, identity_matrix)) {
    const transform = [matrix[0], matrix[1], matrix[3], matrix[4], matrix[6], matrix[7]];
    ret.transform = `matrix(${transform.join(' ')})`;
  }

  if (fill) {
    ret.fill = fill as any;
  }
  if (stroke) {
    ret.stroke = stroke as any;
  }
  if (lineWidth !== undefined && lineWidth >= 0) {
    ret['stroke-width'] = lineWidth + '';
  }
  if (opacity !== undefined && opacity !== 1) {
    ret.opacity = opacity + '';
  }
  if (fillOpacity !== undefined) {
    ret['fill-opacity'] = fillOpacity + '';
  }

  if (strokeOpacity !== undefined) {
    ret['stroke-opacity'] = strokeOpacity + '';
  }

  if (!display) {
    ret.display = 'none';
  }

  if (cursor) {
    ret.cursor = cursor;
  }

  if (fontSize !== undefined) {
    ret['font-size'] = fontSize + '';
  }

  return ret;
}
