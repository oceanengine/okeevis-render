/**
 * hbox
 */
import Text from '../../shapes/Text';
import VNode, { VNodeProps } from '../vnode';
import Box from './box';
import { measureText } from '../../utils/measureText';

export default class VText extends VNode {
  public type: 'text';

  private _relayouted: boolean = false;

  public defaultProps: VNodeProps = {
    value: '',
  };

  public constructor(props: VNodeProps) {
    super(props);
    this.props = { ...this.defaultProps, ...props };
  }

  public render(): Text {
    const color = this.getClosestNodeProps('color') as string;
    const parent = this.parentNode as Box;
    const { x: left, y: top, width, height } = this.bbox;
    let x = left;
    const y = top;
    let textAlign: CanvasTextAlign = 'left';
    const ellipsis = parent.props.ellipsis !== undefined;
    if (ellipsis) {
      if (parent.type === 'hbox') {
        textAlign = this.getTextAlign(parent.props.pack);
        x = this.getTextPosition(left, width + left, parent.props.pack);
      } else if (parent.type === 'hbox') {
        textAlign = this.getTextAlign(parent.props.align);
        x = this.getTextPosition(left, width + left, parent.props.align);
      }
    }
    return new Text({
      text: this.props.value,
      x,
      y: y + height / 2,
      textAlign,
      textBaseline: 'middle',
      fontSize: this.getFontSize(),
      fontFamily: this.getFontFamily(),
      fontWeight: this.getFontWeight() as string,
      lineHeight: this.getExtendAttr('lineHeight') as number,
      fill: color,
      truncate: ellipsis && this.getTruncate(),
    });
  }

  protected getTextAlign(align: 'start' | 'end' | 'center') {
    if (align === 'start') {
      return 'left';
    }
    if (align === 'end') {
      return 'right';
    }
    if (align === 'center') {
      return 'center';
    }
    return 'left';
  }

  protected getTextPosition(left: number, right: number, align: 'start' | 'end' | 'center') {
    if (align === 'start') {
      return left;
    }
    if (align === 'end') {
      return right;
    }
    if (align === 'center') {
      return (left + right) / 2;
    }
    return left;
  }

  public getFontWeight(): string | number {
    return (this.getExtendAttr('fontWeight') as string) || 'normal';
  }

  public getFontSize(): number {
    return (this.getExtendAttr('fontSize') as number) || 12;
  }

  public getFontFamily(): string {
    return (this.getExtendAttr('fontFamily') as string) || 'sans-serif';
  }

  public computeSize() {
    if (this._relayouted) {
      return;
    }
    const { width, height } = measureText(this.props.value, {
      fontSize: this.getFontSize(),
      fontWeight: this.getFontWeight() as any,
      fontFamily: this.getFontFamily(),
    });
    this.minSize = [width, height];
  }

  protected getTruncate(): { outerWidth: number; outerHeight: number; ellipsis: string } {
    const fontSize = this.getFontSize();
    const lineHeight = (this.getExtendAttr('lineHeight') as number) || fontSize;
    const parent = this.parentNode as Box;
    const parentBBox = parent.getContentBox();
    // fix float error
    const outerWidth = parentBBox.width + 1;
    const outerHeight = lineHeight * (this.parentNode.props.lineClamp || 1);
    const ellipsis = this.parentNode.props.ellipsis;
    return {
      outerWidth,
      outerHeight,
      ellipsis,
    };
  }

  public layout() {
    if (this.ownerDocument.hasRelayouted()) {
      return;
    }
    if (this.parentNode.props.ellipsis !== undefined) {
      const textBBox = new Text({
        text: this.props.value,
        x: 0,
        y: 0,
        fontSize: this.getFontSize(),
        fontFamily: this.getFontFamily(),
        fontWeight: this.getFontWeight() as string,
        lineHeight: this.getExtendAttr('lineHeight') as number,
        fill: '#000000',
        truncate: this.getTruncate(),
      }).getBBox();
      this.minSize = [textBBox.width, textBBox.height];
      this._relayouted = true;
      this.ownerDocument.needRelayout();
    }
  }
}
