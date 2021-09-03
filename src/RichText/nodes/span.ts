/**
 * hbox
 */
import Group from '../../shapes/Group';
import { BBox } from '../../utils/bbox';
import { getPadding } from '../flexlayout';
import VNode, { VNodeProps } from '../vnode';
import * as lodash from '../../utils/lodash';

export default class Span extends VNode {
  public type: 'span';

  public defaultProps: VNodeProps = {
    fontSize: 12,
    padding: 0,
    borderWidth: 0,
  };

  public constructor(props: VNodeProps) {
    super(props);
    this.props = { ...this.defaultProps, ...props };
  }

  public render(): Group {
    const group = new Group({
      ...this.getEvents(),
    });
    this.children.forEach(child => {
      group.add(child.render());
    })
    return group;
  }

  public computeSize() {
    const { borderWidth } = this.props;
    const { paddingLeft, paddingRight } = getPadding(this.props.padding);
    this.children.map(child => child.computeSize());
    const width = lodash.sum(this.children.map(item => item.minSize[0]));
    const height = lodash.max(this.children.map(item => item.minSize[1])) || 0;
    this.minSize = [width + paddingLeft + paddingRight + borderWidth * 2, height + borderWidth * 2];
  }

  public getContentBox(): BBox {
    const { paddingLeft, paddingRight } = getPadding(this.props.padding);
    const { borderWidth } = this.props;
    return {
      x: this.bbox.x + paddingLeft + borderWidth / 2,
      y: this.bbox.y + borderWidth / 2,
      width: this.bbox.width - paddingLeft - paddingRight - borderWidth,
      height: this.bbox.height - borderWidth,
    };
  }

  public layout() {
    const { x, y, height } = this.getContentBox();
    this.children.forEach(child => {
      child.bbox.width = child.minSize[0];
      child.bbox.height = child.minSize[1];
    });
    const cy = y + height / 2;
    this.children.reduce((prevX, current) => {
      current.bbox.x = prevX;
      current.bbox.y = cy - current.bbox.height / 2;
      return prevX + current.bbox.width;
    }, x);
    this.children.forEach(child => child.layout());
  }
}
