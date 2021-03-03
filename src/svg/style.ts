import Element, { defaultCanvasContext, ElementAttr, } from '../shapes/Element';
import Group from '../shapes/Group';
import * as mat3 from '../../js/mat3';
import { SVG_NAMESPACE, XLINK_NAMESPACE, } from '../constant';
import Shadow from '../svg/Shadow';

import {
  getSVGColor,
  Gradient,
  LinearGradient,
  RadialGradient,
  Pattern,
  isGradient,
  isPattern,
} from '../color';

const identityMatrix = mat3.create();

export interface SVGElementStyle {
  id: string;
  'clip-path': string;
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
  } = node.attr;
  const ret: Partial<SVGElementStyle> = {};
  const matrix = node.getGlobalTransform();
  const clip = node.getClipElement();

  if (clip) {
    ret['clip-path'] = `url(#${getClipId(clip)})`;
  }

  if (!mat3.exactEquals(matrix, identityMatrix) && !node.isGroup) {
    const transform = [matrix[0], matrix[1], matrix[3], matrix[4], matrix[6], matrix[7]];
    ret.transform = `matrix(${transform.join(' ')})`;
  }

  if (fill) {
    ret.fill = getSVGColor(fill);
  }

  if (stroke) {
    ret.stroke = getSVGColor(stroke);
  }
  if (lineWidth !== undefined && lineWidth >= 0) {
    ret['stroke-width'] = (node.attr.strokeNoScale ? node.getExtendAttr('lineWidth') : lineWidth) + '';
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
    ret['stroke-dashoffset'] = lineDashOffset +'';
  }

  if (lineCap) {
    ret['stroke-linecap'] = lineCap;
  }

  if (lineJoin) {
    ret['stroke-linjoin'] = lineJoin;
  }

  if (miterLimit) {
    ret['stroke-miterlimit'] = miterLimit + '';
  }

  if (shadowColor && shadowBlur >= 0) {
    ret['filter'] = `url(#${node.getShadowObj().id})`
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
  return `lightcharts-clip-${node.id}`;
}
