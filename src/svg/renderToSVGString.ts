import Group from '../shapes/Group';
import {
  getAllDefsClips,
  getAllDefsGradientAndPattern,
  getAllShadows,
  getAllMarkers,
  getSVGRootAttributes,
  getClipId,
} from './style';
import Element from '../shapes/Element';
import Text from '../shapes/Text';
import SVGNode from '../abstract/Node';
import { LinearGradient, RadialGradient, Pattern } from '../color';
import Shadow from './Shadow';
import Marker from '../shapes/Marker';

let renderingWidth: number;
let renderingHeight: number;
let renderingClips: Element[];
let renderingMarkers: Marker[] = [];
let renderingGradientAndPatterns: Array<LinearGradient | RadialGradient | Pattern>;
let renderingShadows: Shadow[];
let isFigma: boolean = false;

export function renderToSVGString(rootGroup: Group, width: number, height: number, figma: boolean): string {
  isFigma = figma;
  renderingWidth = width;
  renderingHeight = height;
  renderingClips = getAllDefsClips(rootGroup);
  renderingGradientAndPatterns = getAllDefsGradientAndPattern(rootGroup);
  renderingShadows = getAllShadows(rootGroup);
  renderingMarkers = getAllMarkers(rootGroup);
  const stringBuffer: string[] = [];
  getNodeString(rootGroup, stringBuffer, true);
  renderingClips = null;
  renderingGradientAndPatterns = null;
  return stringBuffer.join('');
}

function getClipString(node: Element, stringBuffer: string[]) {
  stringBuffer.push(`<clipPath id="${getClipId(node)}">`);
  getNodeString(node, stringBuffer);
  stringBuffer.push('</clipPath>');
}

function getGradientAndPatternString(
  item: LinearGradient | RadialGradient | Pattern,
  stringBuffer: string[],
) {
  getCustomerNodeString(item.getSVGNode(), stringBuffer);
}

function getCustomerNodeString(node: SVGNode | string, stringBuffer: string[]) {
  if (typeof node === 'object') {
    const { svgTagName, svgAttr, childNodes } = node;
    stringBuffer.push(`<${svgTagName}`);
    for (const key in svgAttr) {
      stringBuffer.push(` ${key}="${svgAttr[key]}"`);
    }
    stringBuffer.push('>');
    childNodes && childNodes.forEach(child => getCustomerNodeString(child, stringBuffer));
    stringBuffer.push(`</${svgTagName}>`);
  } else {
    stringBuffer.push(node);
  }
}

function getNodeString(node: Element, stringBuffer: string[], isRoot = false) {
  const tagName = !isRoot ? node.svgTagName : 'svg';
  const attr = !isRoot
    ? (node as any).getSvgAttributes(isFigma)
    : getSVGRootAttributes(renderingWidth, renderingHeight);
  const children = node.isGroup ? node.children() : null;
  stringBuffer.push(`<${tagName}`);
  for (const key in attr) {
    stringBuffer.push(` ${key}="${attr[key]}"`);
  }
  stringBuffer.push('>');

  if (tagName === 'svg') {
    stringBuffer.push('<defs>');
    renderingClips.forEach(clip => getClipString(clip, stringBuffer));
    renderingGradientAndPatterns.forEach(item => getGradientAndPatternString(item, stringBuffer));
    renderingShadows.forEach(item => getCustomerNodeString(item.getSVGNode(), stringBuffer));
    renderingMarkers.forEach(marker => getNodeString(marker, stringBuffer));
    stringBuffer.push('</defs>');
  }

  if (node.type === 'text') {
    const spanList = (node as Text).getSpanList();
    if (spanList.length === 1) {
      stringBuffer.push(spanList[0].text);
    } else {
      spanList.forEach(span => {
        const tspan: SVGNode = {
          svgTagName: 'tspan',
          svgAttr: {
            x: span.x,
            y: span.y
          },
          childNodes: [span.text as any],
        };
        getCustomerNodeString(tspan, stringBuffer);
      })

    }
  }
  if (tagName === 'marker') {
    getNodeString((node as Marker).attr.shape, stringBuffer);
  }

  children && children.forEach(child => getNodeString(child, stringBuffer));

  stringBuffer.push(`</${tagName}>`);
}
