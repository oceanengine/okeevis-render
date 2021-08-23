/**
 * hbox
 */
import Image from '../../shapes/Image';
import VNode, { VNodeProps } from '../vnode';

export default class VImage extends VNode {
  public type: 'image';

  public defaultProps: VNodeProps = {
    borderWidth: 1,
    borderColor: '#333333',
  };

  public constructor(props: VNodeProps) {
    super(props);
    this.props = { ...this.defaultProps, ...props };
  }

  public render(): Image {
    return new Image({
      ...this.bbox,
      ...this.getEvents(),
      src: this.props.src,
    });
  }

  public computeSize() {
    this.minSize = [this.props.width as number, this.props.height as number];
  }
}
