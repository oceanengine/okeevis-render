/**
 * hbox
 */
import Image, { ImageAttr } from '../../shapes/Image';
import Rect from '../../shapes/Rect';
import VNode, { VNodeProps } from '../vnode';

const objectFitMap: Record<CSSStyleDeclaration['objectFit'], ImageAttr['preserveAspectRatio']> = {
  'none': 'xMidYMid',
  'contain': 'xMidYMid',
  'cover': 'xMidYMid',
  'fill': 'none',
  'scale-down': 'xMidYMid',
}

export default class VImage extends VNode {
  public type = 'image';

  public defaultProps: VNodeProps = {
    borderWidth: 1,
    borderColor: '#333333',
    objectFit: 'fill',
  };

  public constructor(props: VNodeProps) {
    super(props);
    this.props = { ...this.defaultProps, ...props };
  }

  public render(): Image {
    const {borderRadius, src, objectFit} = this.props;
    const clip = borderRadius > 0 ? new Rect({
      ...this.bbox,
      borderRadius: borderRadius
    }): null;
    return new Image({
      clip,
      ...this.bbox,
      ...this.getEventsAndCursor(),
      src: src,
      preserveAspectRatio: objectFitMap[objectFit],
    });
  }

  public computeSize() {
    this.minSize = [this.props.width as number, this.props.height as number];
  }
}
