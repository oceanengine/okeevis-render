import Render from '../render';
import Element from '../shapes/Element';
import { HookElement } from './hooks';

// code from doubao
function getNearestCommonAncestor(node1: Element, node2: Element) {
    if (node1 === node2) {
        return node1;
    }
    const ancestors1 = new Set();
    // 将 node1 的所有祖先节点添加到集合中
    while (node1) {
        ancestors1.add(node1);
        node1 = node1.parentNode;
    }
    // 遍历 node2 的祖先节点，查找第一个在 ancestors1 集合中的节点
    while (node2) {
        if (ancestors1.has(node2)) {
            return node2;
        }
        node2 = node2.parentNode;
    }
    return null;
}


export class ReactSystem {
  private _hookElementEffects: Function[] = [];

  private _effectPending: boolean = false;

  private _updateStatePending: boolean = false;

  private _updateStateElements: Element[] = [];

  private _render: Render;

  public constructor(render: Render) {
    this._render = render;
  }

  public pushPendingEffect(effect: Function) {
    this._hookElementEffects.unshift(effect);
    if (!this._effectPending) {
      this._effectPending = true;
      this._render.requestAnimationFrame(() => {
        this._hookElementEffects.forEach(effect => effect());
        this._effectPending = false;
        this._hookElementEffects.length = 0;
      });
    }
  }
  public pushUpdateStateElement(element: Element) {
    if (this._updateStateElements.includes(element)) {
        return;
    }
    this._updateStateElements.push(element);

    if (this._updateStatePending) {
        return;
    }

    this._updateStatePending = true;
    
    Promise.resolve().then(() => {
        const elements = this._updateStateElements;
        const root = elements.reduce((pre, cur) => {
            return getNearestCommonAncestor(pre, cur);
        }, elements[0]) as HookElement;
        (root as any).renderWithHooks(true);
        elements.forEach(element => {
            const ancestors = element.getAncestorNodes();
            ancestors.forEach(ancestor => {
              if (root.contains(ancestor) && Element.isHookElement(ancestor) && (ancestor as any).$$typeof === 'react.memo') {
                ancestor.willUpdate();
              }
            })
        });
        this._updateStateElements.length = 0;
        this._updateStatePending = false;
    })
  }

  public dispose() {
    this._hookElementEffects.length = 0;
    this._updateStateElements.length = 0;
    this._render = null;
  }
}
