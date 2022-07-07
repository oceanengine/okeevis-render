/**
 * hbox
 */
import Image from '../../shapes/Image';
import Rect from '../../shapes/Rect';
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
    const clip = this.props.borderRadius > 0 ? new Rect({
      ...this.bbox,
      borderRadius: this.props.borderRadius
    }): null;
    return new Image({
      clip,
      ...this.bbox,
      ...this.getEventsAndCursor(),
      src: this.props.src,
    });
  }

  public computeSize() {
    this.minSize = [this.props.width as number, this.props.height as number];
  }
}
