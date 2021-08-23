/**
 * vbox
 */
import Rect, { RectConf } from '../../shapes/Rect';
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
    background: 'rgba(0,0,0,0)'
  };

  public children: VNode[];

  public constructor(props: VNodeProps) {
    super(props);
    this.props = { ...this.defaultProps, ...props };
  }

  public render(): Rect {
    const isRoot = !this.parentNode;
    const attr: RectConf = {
      ...this.bbox,
      ...this.getStyle(),
      ...this.getEvents(),
      ...this.props.boxShadow,
    };
    return isRoot ? new Rect(rect1px(attr)) : new Rect(attr);
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
