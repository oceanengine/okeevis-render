/**
 * hbox
 */
import VNode, { VNodeProps } from '../vnode';
import * as lodash from '../../utils/lodash';

export default class Spacer extends VNode {
  public static selfClosing: boolean = true;

  public type: 'spacer';

  public defaultProps: VNodeProps = {
    flex: 0,
  };

  public constructor(props: VNodeProps) {
    super(props);
    this.props = { ...this.defaultProps, ...props };
  }

  public render(): null {
    return null;
  }

  public computeSize() {
    const width = lodash.isNumber(this.props.width) ? this.props.width : 0;
    const height = lodash.isNumber(this.props.height) ? this.props.height : 0;
    this.minSize = [this.getClampSize(width, 'width'), this.getClampSize(height, 'height')];
  }
}
