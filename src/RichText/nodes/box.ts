/**
 * vbox
 */
import Group from '../../shapes/Group';
import Rect, { RectAttr } from '../../shapes/Rect';
import { createRef } from '../../utils/ref';
import { BBox } from '../../utils/bbox';
import { getPadding } from '../flexlayout';
import VNode, { VNodeProps } from '../vnode';
import * as lodash from '../../utils/lodash';
import { rect1px } from '../../utils/line1px';

export default class Box extends VNode {
  public defaultProps: VNodeProps = {
    lineClamp: 1,
    borderRadius: 0,
    borderWidth: 0,
    padding: 0,
    align: 'start',
    pack: 'start',
    flex: 0,
    background: 'rgba(0,0,0,0)',
  };

  public children: VNode[];

  public constructor(props: VNodeProps) {
    super(props);
    this.props = { ...this.defaultProps, ...props };
  }

  public render(): Group {
    const group = new Group({
      ...this.getEventsAndCursor(),
    });
    const { borderRadius, borderWidth, boxShadow } = this.props;
    const isRoot = !this.parentNode;
    if (borderRadius && !borderWidth && isRoot && !boxShadow) {
      const clipRef = createRef();
      const rect = new Rect({
        ref: clipRef,
        ...this.bbox,
        r: this.props.borderRadius,
        fill: 'none',
        stroke: 'none',
      });
      group.setAttr('clip', clipRef);
      group.add(rect);
    }
    const attr: RectAttr = {
      ...this.bbox,
      ...this.getStyle(),
      ...this.props.boxShadow,
    };
    const rect = isRoot ? new Rect(rect1px(attr)) : new Rect(attr);
    group.add(rect);
    this.children.forEach(child => group.add(child.render()));
    return group;
  }

  public getContentSize(): [number, number] {
    return [0, 0];
  }

  public getContentBox(): BBox {
    const { paddingTop, paddingLeft, paddingRight, paddingBottom } = getPadding(this.props.padding);
    const { borderWidth } = this.props;
    return {
      x: this.bbox.x + paddingLeft + borderWidth / 2,
      y: this.bbox.y + paddingTop + borderWidth / 2,
      width: this.bbox.width - paddingLeft - paddingRight - borderWidth,
      height: this.bbox.height - paddingTop - paddingBottom - borderWidth,
    };
  }

  public computeSize() {
    const { paddingTop, paddingLeft, paddingRight, paddingBottom } = getPadding(this.props.padding);
    const { borderWidth } = this.props;
    const [contentWidth, contentHeight] = this.getContentSize();
    let width = lodash.isNumber(this.props.width)
      ? this.props.width
      : contentWidth + paddingLeft + paddingRight;
    let height = lodash.isNumber(this.props.height)
      ? this.props.height
      : contentHeight + paddingTop + paddingBottom;

    width = this.getClampSize(width, 'width');
    height = this.getClampSize(height, 'height');

    this.minSize = [width + borderWidth * 2, height + borderWidth * 2];
  }
}
