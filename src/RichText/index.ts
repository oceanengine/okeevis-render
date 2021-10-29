/**
 * @desc rich text
 * @author liwensheng
 */
import CustomElement from '../shapes/CustomElement';
import Element from '../shapes/Element';
import { VNodeProps } from './vnode';
import RichObj from './rich-obj';
import { EventConf } from '../event';

export type VNodeObject = VNodeProps & {
  type: string;
  children?: VNodeObject[] | string[];
} & EventConf;

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
    };
  }

  protected getObservedAttr() {
    return ['text', 'textAlign', 'textBaseline', 'x', 'y', 'fontSize'];
  }

  protected onAttrChange(key: any, newvalue: any, oldvalue: any) {
    super.onAttrChange(key, newvalue, oldvalue);
    if (key === 'text') {
      this._richObj = new RichObj(this.attr);
    }
  }

  protected render(): Element {
    if (!this._richObj) {
      return;
    }
    const rootNode = this._richObj.node;
    this._richObj.layout();
    return rootNode.render();
  }
}
