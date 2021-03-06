/**
 * @desc rich text
 * @author liwensheng
 */
import * as lodash from '../utils/lodash';
import VNode from './vnode';
import TextNode from './nodes/text';
import parseVNode, { TagsMap } from './parser';
import { TextAttr } from '../shapes/Text';
import { VNodeObject } from './index';

export interface RichTextAttr extends Omit<TextAttr, 'text'> {
  text?: string | VNodeObject;
}
/**
 * rich text
 */
export default class RichText {
  public conf: RichTextAttr;

  public node: VNode;

  private _needRelayout: boolean;

  private _relayouted: boolean;

  public constructor(conf: RichTextAttr) {
    this.conf = conf;
    this.init();
  }

  public init(): void {
    let { text } = this.conf;
    if (text && typeof text === 'object' && text.type) {
      this.node = this._createRichNode(text);
      return;
    }
    if (lodash.isNull(text) || lodash.isUndefined(text)) {
      text = '';
    } else {
      text = text.toString();
    }
    const result = parseVNode(text, this);
    this.node = result[0];
  }

  public needRelayout() {
    if (!this._relayouted) {
      this._needRelayout = true;
    }
  }

  public layout(): void {
    this.node.computeSize();
    const { x = 0, y = 0, textAlign = 'left', textBaseline = 'top' } = this.conf;
    const [width, height] = this.node.minSize;
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
    this.node.bbox.x = left;
    this.node.bbox.y = top;
    this.node.bbox.width = width;
    this.node.bbox.height = height;
    this.node.layout();
    if (this._needRelayout) {
      this._relayouted = true;
      this._needRelayout = false;
      this.layout();
    }
  }

  public hasRelayouted(): boolean {
    return this._relayouted;
  }

  public getBoxSize(): { width: number; height: number } {
    return { width: this.node.bbox.width, height: this.node.bbox.height };
  }

  private _createRichNode(obj: VNodeObject): VNode {
    const CNode = TagsMap[obj.type.toLowerCase() as keyof typeof TagsMap];
    const node = new CNode(obj);
    node.ownerDocument = this;
    obj.children?.forEach((child: VNodeObject | string) => {
      if (child && typeof child === 'object' && child.type) {
        node.appendChild(this._createRichNode(child));
      } else {
        node.appendChild(
          new TextNode({
            value: child as string,
          }),
        );
      }
    });
    return node;
  }
}
