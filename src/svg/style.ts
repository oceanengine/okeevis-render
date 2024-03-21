import Element, { transformKeys, defaultCanvasContext, ElementAttr } from '../shapes/Element';
import Group from '../shapes/Group';
import Marker from '../shapes/Marker';
import * as mat3 from '../../js/mat3';
import { SVG_NAMESPACE, XLINK_NAMESPACE, IDENTRY_MATRIX } from '../constant';
import Shadow from './Shadow';

import {
  getSVGColor,
  Gradient,
  LinearGradient,
  RadialGradient,
  Pattern,
  isGradient,
  isPattern,
} from '../color';

function getSvgMatrix(matrix: mat3): string {
  const transform = [matrix[0], matrix[1], matrix[3], matrix[4], matrix[6], matrix[7]];
  return `matrix(${transform.join(' ')})`;
}

// const identityMatrix = mat3.createVec3();

export interface SVGElementStyle {
  id: string;
  'clip-path': string;
  fill: string;
  stroke: string;
  'stroke-width': string;
  'stroke-linecap': string;
  'stroke-linejoin': string;
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
  'marker-start': string;
  'marker-mid': string;
  'marker-end': string;
}

export const SVGAttributeMap: Record<keyof SVGElementStyle, keyof ElementAttr> = {
  'clip-path': 'clip',
  fill: 'fill',
  stroke: 'stroke',
  'stroke-width': 'lineWidth',
  'stroke-linecap': 'lineCap',
  'stroke-linjoin': 'lineJoin',
  'stroke-miterlimit': 'miterLimit',
  'stroke-dasharray': 'lineDash',
  'stroke-dashoffset': 'lineDashOffset',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'font-family': 'fontFamily',
  'font-style': 'fontStyle',
  display: 'display',
  // anchor: string;
  // transform: string;
  opacity: 'opacity',
  'fill-opacity': 'fillOpacity',
  'stroke-opacity': 'strokeOpacity',
  // filter: 'filter',
  cursor: 'cursor',
} as any;

export function getSVGRootAttributes(width: number, height: number): any {
  return {
    width,
    height,
    fill: 'none',
    xmlns: SVG_NAMESPACE,
    'xmlns:xlink': XLINK_NAMESPACE,
    style: `user-select: none;cursor: default;font-size:${
      defaultCanvasContext.fontSize + 'px'
    }; font-family: ${defaultCanvasContext.fontFamily}`,
  };
}

export function getSVGStyleAttributes(node: Element): Partial<SVGElementStyle> {
  const {
    fill,
    stroke,
    lineWidth,
    lineDash,
    lineDashOffset,
    lineCap,
    miterLimit,
    lineJoin,
    opacity,
    fillOpacity,
    strokeOpacity,
    cursor,
    display,
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    shadowColor,
    shadowBlur,
    markerStart,
    markerEnd,
  } = node.attr;
  const ret: Partial<SVGElementStyle> = {};
  const clip = node.getClipElement();

  const selfMatrix = node.getTransform();
  const dragOffset = node.getDragOffset();
  const hasDrag = dragOffset[0] !== 0 || dragOffset[1] !== 0;

  if (clip) {
    ret['clip-path'] = `url(#${getClipId(clip)})`;
  }

  if (hasDrag  || selfMatrix !== IDENTRY_MATRIX || transformKeys.some(key => key in node.attr)) {
    if (!hasDrag) {
      ret.transform = getSvgMatrix(selfMatrix);
    } else {
      const globalTransform = node.getGlobalTransform();
      const parentTransform = node.parentNode.getGlobalTransform();
      const out = mat3.createVec3();
      mat3.multiply(out, mat3.invert(out, parentTransform), globalTransform);
      ret.transform = getSvgMatrix(out);
    }
  }

  if (fill) {
    ret.fill = getSVGColor(fill);
  }

  if (stroke) {
    ret.stroke = getSVGColor(stroke);
  }
  if (lineWidth !== undefined && lineWidth >= 0) {
    ret['stroke-width'] =
      (node.attr.strokeNoScale ? node.getExtendAttr('lineWidth') : lineWidth) + '';
  }
  if (opacity !== undefined) {
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

  if (fontWeight !== undefined) {
    ret['font-weight'] = fontWeight + '';
  }

  if (fontFamily !== undefined) {
    ret['font-family'] = fontFamily;
  }

  if (fontStyle !== undefined) {
    ret['font-style'] = fontStyle;
  }

  if (lineDash) {
    ret['stroke-dasharray'] = lineDash.join(' ');
  }

  if (lineDashOffset !== undefined) {
    ret['stroke-dashoffset'] = lineDashOffset + '';
  }

  if (lineCap) {
    ret['stroke-linecap'] = lineCap;
  }

  if (lineJoin) {
    ret['stroke-linejoin'] = lineJoin;
  }

  if (miterLimit) {
    ret['stroke-miterlimit'] = miterLimit + '';
  }

  if (shadowColor && shadowBlur >= 0) {
    ret.filter = `url(#${node.getShadowObj().id})`;
  }

  if (markerStart) {
    ret['marker-start'] = `url(#${markerStart.getMarkerId()})`;
  }
  if (markerEnd) {
    ret['marker-end'] = `url(#${markerEnd.getMarkerId()})`;
  }

  return ret;
}

export function getAllDefsClips(group: Group, out: Element[] = []): Element[] {
  group.eachChild(child => {
    const clip = child.getClipElement();
    if (clip && !clip.parentNode && out.indexOf(clip) === -1) {
      out.push(clip);
    }
    if (child.isGroup) {
      getAllDefsClips(child as Group, out);
    }
  });
  return out;
}

export function getAllDefsGradientAndPattern(
  group: Group,
  out: Array<LinearGradient | RadialGradient | Pattern> = [],
): Array<LinearGradient | RadialGradient | Pattern> {
  group.eachChild(child => {
    const { fill, stroke } = child.attr;
    if (isGradient(fill) || isPattern(fill)) {
      out.indexOf(fill as Gradient) === -1 && out.push(fill as Gradient);
    }
    if (isGradient(stroke) || isPattern(stroke)) {
      out.indexOf(stroke as Gradient) === -1 && out.push(stroke as Gradient);
    }
    if (child.isGroup) {
      getAllDefsGradientAndPattern(child as Group, out);
    }
  });
  return out;
}

export function getAllMarkers(group: Group, out: Array<Marker> = []): Marker[] {
  group.eachChild(child => {
    const { markerStart, markerEnd } = child.attr;
    if (markerStart) {
      out.indexOf(markerStart) === -1 && out.push(markerStart);
    }
    if (markerEnd) {
      out.indexOf(markerEnd) === -1 && out.push(markerEnd);
    }
    if (child.isGroup) {
      getAllMarkers(child as Group, out);
    }
  });
  return out;
}

export function getAllShadows(group: Group, out: Array<Shadow> = []): Shadow[] {
  group.eachChild(child => {
    const { shadowColor, shadowBlur } = child.attr;
    if (shadowColor && shadowBlur >= 0) {
      const shadow = child.getShadowObj();
      out.indexOf(shadow) === -1 && out.push(shadow);
    }
    if (child.isGroup) {
      getAllShadows(child as Group, out);
    }
  });
  return out;
}

export function getClipId(node: Element) {
  return `okee-render-clip-${node.id}`;
}
