/**
 * @desc vnode
 */
import * as lodash from '../utils/lodash';
import Element from '../shapes/Element';
import { BBox } from '../utils/bbox';
import { TextConf } from '../shapes/Text';
import { PaddingOption } from './flexlayout'
import Rich from './index';

export interface ShadowStyle {
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}


export interface VNodeProps {
  flex?: number;
  align?: 'start' | 'end' | 'center';
  pack?: 'start' | 'end' | 'center';
  padding?: PaddingOption;
  opacity?: number;
  width?: number | string;
  height?: number | string;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  borderColor?: string;
  borderWidth?: number;
  background?: string;
  borderRadius?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  lineClamp?: number;
  // 暂时不支持lineHeight
  lineHeight?: number;
  src?: string;
  value?: string;
  color?: string;
  ellipsis?: string;
  boxShadow?: ShadowStyle;
}

function parseNumber(attr: string): number {
  return parseFloat(attr);
}

function parseNumberOrPercent(attr: string): number | string {
  if (attr.indexOf('%') !== -1) {
    return attr;
  }
  return parseFloat(attr);
}
function parseString(attr: string): string {
  return attr;
}

function parseArray(attr: string): number[] {
  return attr.split(/\s+/).map(val => parseFloat(val));
}

function parseNumberOrString(attr: string): string | number {
  if (isNaN(parseInt(attr, 10))) {
    return attr;
  }
  return parseInt(attr, 10);
}

function parseBoxShadow(attr: string): ShadowStyle {
  const [a, b, c, shadowColor] = attr.split(/\s+/);
  return { shadowOffsetX: parseFloat(a), shadowOffsetY: parseFloat(b), shadowBlur: parseFloat(c), shadowColor };
}

export const NodeAttributeParser: Record<
  keyof VNodeProps,
  (attr: string) => string | number | number[] | ShadowStyle
> = {
  flex: parseNumber,
  align: parseString,
  pack: parseString,
  padding: parseArray,
  opacity: parseNumber,
  width: parseNumberOrPercent,
  height: parseNumberOrPercent,
  minWidth: parseNumber,
  maxWidth: parseNumber,
  minHeight: parseNumber,
  maxHeight: parseNumber,
  borderColor: parseString,
  borderWidth: parseNumber,
  background: parseString,
  borderRadius: parseArray,
  fontSize: parseNumber,
  fontFamily: parseString,
  fontWeight: parseNumberOrString,
  lineHeight: parseNumber,
  lineClamp: parseNumber,
  src: parseString,
  value: parseString,
  color: parseString,
  ellipsis: parseString,
  boxShadow: parseBoxShadow,
};

export const attributeList = Object.keys(NodeAttributeParser) as Array<keyof VNodeProps>;

export interface ElementStyle {
  opacity?: number;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  r?: number;
}
/**
 * vnode
 */
export default class VNode<T extends VNodeProps = VNodeProps> {
  public static selfClosing: boolean = false;

  public type: string;

  public props: T;

  public parentNode: VNode = null;

  public children: VNode[] = [];

  public bbox: BBox = { x: 0, y: 0, width: 0, height: 0 };

  public defaultProps: T;

  public minSize: [number, number] = [0, 0];

  public ownerDocument: Rich = null;

  public constructor(props: T) {
    this.props = { ...this.defaultProps, ...props };
  }

  public render(): Element<any> {
    return null;
  }

  public appendChild(child: VNode) {
    child.parentNode = this;
    child.ownerDocument = this.ownerDocument;
    this.children.push(child);
  }

  public getRoot(): VNode {
    let root = this as VNode;
    while (root.parentNode) {
      root = root.parentNode;
    }
    return root;
  }

  public getClosestNodeProps(name: keyof VNodeProps) {
    let node = this.parentNode;
    while (node) {
      if (node.props[name] !== undefined) {
        return node.props[name];
      }
      node = node.parentNode;
    }
  }

  public getExtendAttr(attr: keyof (TextConf | VNodeProps)) {
    const value = this.getClosestNodeProps(attr);
    if (value === undefined) {
      return this.ownerDocument.getExtendAttr(attr)
    }
    return value;
  }

  public computeSize(): void {
    // nothing todo
  }

  public layout(): void {
    // blank;
  }

  public getStyle(): ElementStyle {
    const { borderColor, borderRadius, background, borderWidth } = this.props;
    return {
      stroke: borderColor,
      r: borderRadius,
      fill: background,
      lineWidth: borderWidth,
    }
  }

  protected getClampSize(size: number, sizeType: 'width' | 'height'): number {
    const minSize = this.props[sizeType === 'width' ? 'minWidth' : 'minHeight'];
    const maxSize = this.props[sizeType === 'width' ? 'maxWidth' : 'maxHeight'];
    if (lodash.isNumber(maxSize) && size > maxSize) {
      size = maxSize;
    }
    if (lodash.isNumber(minSize) && size < minSize) {
      size = minSize;
    }
    return size;
  }
}
