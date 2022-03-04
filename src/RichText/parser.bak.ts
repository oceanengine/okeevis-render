import Rich from './rich-obj';
import VNode, { VNodeProps, NodeAttributeParser, attributeList } from './vnode';
import VBox from './nodes/vbox';
import HBox from './nodes/hbox';
import Image from './nodes/image';
import Span from './nodes/span';
import Text from './nodes/text';
import HorizontalLine from './nodes/hr';
import Spacer from './nodes/spacer';
import * as lodash from '../utils/lodash';
import { parseXML } from '../utils/xmlparser';


export const TagsMap = {
  vbox: VBox,
  hbox: HBox,
  image: Image,
  hr: HorizontalLine,
  span: Span,
  spacer: Spacer,
};

function parseAttributes(attribs: Record<keyof VNodeProps, string>): VNodeProps {
  const ret: VNodeProps = {};
  attributeList.forEach(key => {
    const attr = attribs[key];
    if (attr && attr.trim()) {
      lodash.set(ret, key, NodeAttributeParser[key](attr));
    }
  });
  return ret;
}

export default function parseRichNode(template: string, document: Rich): VNode[] {
  const nodesStack: VNode[] = [];
  let currentNode: VNode = null;
  const root: VNode[] = [];
  if (!template) {
    return [];
  }
  parseXML(
    template,
    {
      onopentag(name: keyof typeof TagsMap, attribs: any) {
        const NodeConstroctor = TagsMap[name];
        if (NodeConstroctor) {
          const node = new NodeConstroctor(parseAttributes(attribs));
          node.ownerDocument = document;
          if (currentNode) {
            currentNode.appendChild(node);
          } else {
            root.push(node);
          }
          currentNode = node;
          nodesStack.push(currentNode);
        }
      },
      ontext(text: string) {
        const trimText = text.trim();
        if (trimText) {
          currentNode.appendChild(new Text({ value: trimText }));
        }
      },
      onclosetag() {
        nodesStack.pop();
        currentNode = nodesStack[nodesStack.length - 1];
      },
    }
  );
  return root;
}
