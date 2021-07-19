/**
 * @desc rich text
 * @author liwensheng
 */
import CustomElement from '../shapes/CustomElement';
import { createRef, } from '../utils/ref';
import Rect from '../shapes/rect';
import Group from '../shapes/Group';
import VNode from './vnode';
import parseVNode from './parser';

export interface RichTextConf {
  rich?: boolean;
}


export default class RichText extends CustomElement<RichTextConf> {
  private _rootNode: VNode;

  private _needRelayout: boolean;

  private _relayouted: boolean;

  public getDefaultAttr() {
    return {
      ...super.getDefaultAttr(),
      rich: true,
    }
  }

  protected get observedAttributes() {
    return ['text', 'textAlign', 'textBaseline', 'x', 'y', 'fontSize']
  }

  protected onAttrChange(key: any, newvalue: any, oldvalue: any) {
    super.onAttrChange(key, newvalue, oldvalue);
    if (key === 'text') {
     this._rootNode = parseVNode(newvalue, this)[0];
    }
  }

  public needRelayout() {
    if (!this._relayouted) {
      this._needRelayout = true;
    }
  }

  private layout(): void {
    this._rootNode.computeSize();
    const textAlign = this.getExtendAttr('textAlign');
    const textBaseline = this.getExtendAttr('textBaseline');
    const { x = 0, y = 0 } = this.attr;
    const [width, height] = this._rootNode.minSize;
    let left: number = x;
    let top: number = y;
    if (textAlign === 'left') {
      left = x;
    } else if (textAlign === 'center') {
      left = x - width / 2;
    } else if (textAlign === 'right') {
      left = x - width;
    }
    if (textBaseline === 'top') {
      top = y;
    } else if (textBaseline === 'middle') {
      top = y - height / 2;
    } else if (textBaseline === 'bottom') {
      top = y - height;
    }
    this._rootNode.bbox.x = left;
    this._rootNode.bbox.y = top;
    this._rootNode.bbox.width = width;
    this._rootNode.bbox.height = height;
    this._rootNode.layout();
    if (this._needRelayout) {
      this._relayouted = true;
      this._needRelayout = false;
      this.layout();
    }
  }

  public hasRelayouted(): boolean {
    return this._relayouted;
  }

  private renderNode(node: VNode, group: Group) {
    group.add(node.render());
    node.children.forEach(child => this.renderNode(child, group));
  }

  protected render(): Group {
    this.layout();
    const group = new Group({shadowBlur: 0});
    group.setAttr({shadowBlur: 0});
    this.renderNode(this._rootNode, group);
    if (this._rootNode.props.borderRadius) {
      const clipRef = createRef();
      const rect = new Rect({
        ref: clipRef,
        ...this._rootNode.bbox,
        r: this._rootNode.props.borderRadius,
        fill: 'none',
        stroke: 'none'
      });
      group.setAttr('clip', clipRef);
      group.add(rect);
    }
    return group;
  }
}