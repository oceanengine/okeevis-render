/**
 * hbox
 */
import Line from '../../shapes/Line';
import VNode, { VNodeProps } from '../vnode';
import * as lodash from '../../utils/lodash';

export default class HorizontalLine extends VNode {
  public static selfClosing: boolean = true;

  public type: 'hr';

  public defaultProps: VNodeProps = {
    width: '100%',
    height: 0,
    borderWidth: 1,
    borderColor: '#333333',
  };

  public constructor(props: VNodeProps) {
    super(props);
    this.props = { ...this.defaultProps, ...props };
  }

  public render(): Line {
    const { x, y, width } = this.bbox;
    const y0 = y + this.props.borderWidth / 2;
    return new Line({
      x1: x,
      y1: y0,
      x2: x + width,
      y2: y0,
      ...this.getStyle(),
    });
  }

  public computeSize() {
    const width = lodash.isNumber(this.props.width) ? this.props.width : 0;
    this.minSize = [this.getClampSize(width, 'width'), this.props.borderWidth];
  }
}
