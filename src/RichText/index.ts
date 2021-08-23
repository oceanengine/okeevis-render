/**
 * @desc rich text
 * @author liwensheng
 */
import CustomElement from '../shapes/CustomElement';
import { createRef, } from '../utils/ref';
import Rect from '../shapes/Rect';
import Group from '../shapes/Group';
import VNode, { VNodeProps } from './vnode';
import RichObj from './rich-obj';
import { EventConf } from '../event';

export type VNodeObject = VNodeProps & { type: string, children?: VNodeObject[] | string[]} & EventConf;

export interface RichTextConf {
  rich?: boolean;
  text: string | VNodeObject;
}

export default class RichText extends CustomElement<RichTextConf> {
  public type = 'richText';

  private _richObj: RichObj;

  public getDefaultAttr() {
    return {
      ...super.getDefaultAttr(),
      rich: true,
    }
  }

  protected getObservedAttr() {
    return ['text', 'textAlign', 'textBaseline', 'x', 'y', 'fontSize']
  }

  protected onAttrChange(key: any, newvalue: any, oldvalue: any) {
    super.onAttrChange(key, newvalue, oldvalue);
    if (key === 'text') {
      this._richObj = new RichObj(this.attr);
    }
  }


  private renderNode(node: VNode, group: Group) {
    group.add(node.render());
    node.children.forEach(child => this.renderNode(child, group));
  }

  protected render(): Group {
    if (!this._richObj) {
      return;
    }
    const rootNode = this._richObj.node;
    this._richObj.layout();
    const group = new Group({ shadowBlur: 0 });
    group.setAttr({ shadowBlur: 0 });
    this.renderNode(rootNode, group);
    if (rootNode.props.borderRadius) {
      const clipRef = createRef();
      const rect = new Rect({
        ref: clipRef,
        ...rootNode.bbox,
        r: rootNode.props.borderRadius,
        fill: 'none',
        stroke: 'none'
      });
      group.setAttr('clip', clipRef);
      group.add(rect);
    }
    return group;
  }
}