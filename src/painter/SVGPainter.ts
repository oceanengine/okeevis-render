import Es6Set from '../utils/set';
import { diff } from '@egjs/list-differ';
import Painter from '../abstract/Painter';
import { registerPainter } from './index';
import Text, {TextSpan, } from '../shapes/Text';
import Render from '../render';
import Group from '../shapes/Group';
import Element from '../shapes/Element';
import { SVG_NAMESPACE, XLINK_NAMESPACE } from '../constant';
import { fpsRect, fpsText } from './fps';
import SVGNode from '../abstract/Node';
import { getSVGRootAttributes, SVGAttributeMap, SVGElementStyle, getClipId, } from '../svg/style';
import Shadow from '../svg/Shadow';

import { Gradient, LinearGradient, RadialGradient, Pattern, isGradient, isPattern } from '../color';

function setToArray<T>(set: Es6Set<T>, out: T[] = []): T[] {
  set.forEach(value => {
    out.push(value);
  });
  return out;
}
// todo 支持渐变, 剪切, 阴影

export default class SVGPainter implements Painter {
  public render: Render;

  private _svgRoot: HTMLElement;

  private _loadedSVGElements: Record<number, SVGElement> = {};

  private _frameTimes: number[] = [];

  private _svgDefElement: SVGDefsElement;

  private _loadedDefsElements: Record<string, SVGGradientElement> = {};

  private _defsClipElements: Es6Set<Element> = new Es6Set();

  private _defsGradientsAndPatterns: Es6Set<
    LinearGradient | RadialGradient | Pattern
  > = new Es6Set();

  private _dfsShadows: Es6Set<Shadow> = new Es6Set();

  private _isFirstFrame: boolean = false;

  private _canvas: HTMLCanvasElement;

  public constructor(render: Render) {
    this.render = render;
    this._initSVGRoot();
  }

  public resize(width: number, height: number) {
    this._svgRoot.setAttribute('width', width + 'px');
    this._svgRoot.setAttribute('height', height + 'px');
  }

  public onFrame(now: number) {
    const showFPS = this.render.showFPS;
    if (showFPS && now) {
      this._frameTimes.push(now);
      if (this._frameTimes.length > 60) {
        this._frameTimes.shift();
      }
    }
    if (this.render.needUpdate()) {
      this._updateGradientsAndPatterns();
      this.__updateClips();
      this._updateShadows();
      if (this._isFirstFrame) {
        this.render.getRoot().eachChild(child => this._mountNode(this._svgRoot as any, child));
      } else {
        const dirtyElements = this.render.getDirtyElements();
        dirtyElements.forEach(dirtyNode => {
          const id = dirtyNode.id;
          if (this._loadedSVGElements[id]) {
            if (dirtyNode.ownerRender) {
              this._updateNode(dirtyNode);
            } else {
              this._removeNode(dirtyNode);
            }
          } else  {
            const parentNode = dirtyNode.parentNode;
            this._mountNode(this._loadedSVGElements[parentNode.id], dirtyNode);
          }
        });
      }
    }
    const chunk = this.render.getRoot().getOneChunk();
    if (chunk) {
      this._paintChunk(chunk.parent, chunk.items);
    }
    this._isFirstFrame = false;
    this.render.showFPS && this._drawFPS();
  }

  public getContext(): CanvasRenderingContext2D {
    if (!this._canvas) {
      this._canvas = document.createElement('canvas');
    }
    return this._canvas.getContext('2d');
  }

  public findDOMNode(node: Element): SVGElement {
    const id = node.id;
    return this._loadedSVGElements[id];
  }

  public removeNodeAttribute(node: Element, attr: string) {
    if (attr in SVGAttributeMap) {
      this.findDOMNode(node)?.removeAttribute(SVGAttributeMap[attr as keyof SVGElementStyle]);
    }
  }

  public getBase64(): string {
    return  'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent((this._svgRoot.parentNode as HTMLElement).innerHTML)));
  }

  public dispose() {
    delete this._loadedSVGElements;
    delete this._svgDefElement;
    delete this._loadedSVGElements;
    delete this._defsClipElements;
    delete this._defsGradientsAndPatterns;
    delete this._dfsShadows;
    delete this._canvas;
    this._svgRoot.parentNode.removeChild(this._svgRoot);
    this._canvas = null;
  }

  private _updateGradientsAndPatterns() {
    const prevGradients = setToArray(this._defsGradientsAndPatterns) as any[];
    this._defsGradientsAndPatterns.clear();
    this._getAllGradients(this.render.getRoot());
    const currentGradients = setToArray(this._defsGradientsAndPatterns) as any[];
    const diffResult = diff(prevGradients, currentGradients, (gradient: Gradient) => gradient.id);
    diffResult.added.forEach(index => {
      const gradientOrPattern = currentGradients[index] as Gradient | Pattern;
      const defsGradientPatterNode = this._mountDataNode(
        this._svgDefElement,
        gradientOrPattern.getSVGNode(),
      ) as any;
      this._loadedDefsElements[gradientOrPattern.id] = defsGradientPatterNode;
    });

    diffResult.removed.forEach(index => {
      const gradient = prevGradients[index];
      const el = this._loadedDefsElements[gradient.id];
      el.parentNode.removeChild(el);
      delete this._loadedDefsElements[gradient.id];
    });
  }

  private __updateClips() {
    const prevClips = setToArray(this._defsClipElements);
    this._defsClipElements.clear();
    this._getAllDfsClips(this.render.getRoot());
    const currentClips = setToArray(this._defsClipElements);
    const diffResult = diff(prevClips, currentClips, clip => clip.id);
    diffResult.added.forEach(index => {
      this._mountNode(this._svgDefElement, currentClips[index], true);
    });
    diffResult.removed.forEach(index => {
      this._removeNode(prevClips[index]);
    });
  }

  private _updateShadows() {
    const prevShadows = setToArray(this._dfsShadows);
    this._dfsShadows.clear();
    this._getAllShadows(this.render.getRoot());
    const currentShadows = setToArray(this._dfsShadows);
    const diffResult = diff(prevShadows, currentShadows, obj => obj.id);
    diffResult.added.forEach(index => {
      const defObject = currentShadows[index];
      const defsGradientPatterNode = this._mountDataNode(
        this._svgDefElement,
        defObject.getSVGNode(),
      ) as any;
      this._loadedDefsElements[defObject.id] = defsGradientPatterNode;
    });

    diffResult.removed.forEach(index => {
      const defsObject = prevShadows[index];
      const el = this._loadedDefsElements[defsObject.id];
      el.parentNode.removeChild(el);
      delete this._loadedDefsElements[defsObject.id];
    });

    diffResult.maintained.forEach(([from, to]) => {
      const obj = prevShadows[from]
      const dom = this._loadedDefsElements[obj.id].firstChild as any as SVGElement;
      this._setElementAttr(dom, obj.getSVGNode().childNodes[0].svgAttr);
    })
  }

  private _mountNode(parent: SVGElement, node: Element, isClip: boolean = false) {
    if (this._loadedSVGElements[node.id]) {
      return;
    }
    const tagName = node.svgTagName;
    const attributes = node.getSvgAttributes();
    const id = node.id;
    const svgDom = this._createSVGElement(tagName, attributes);
    let appendNode = svgDom;
    if (tagName === 'text') {
      const spanList = (node as Text).getSpanList();
      this._mountTextNode(svgDom, spanList);
    }
    if (isClip) {
      const clip = this._createSVGElement('clipPath', { id: getClipId(node)});
      clip.appendChild(svgDom);
      appendNode = clip;
    }
    this._loadedSVGElements[id] = svgDom;

    if (node.isGroup) {
      (node as Group).eachChild(child => this._mountNode(svgDom, child));
    }

    parent.appendChild(appendNode);

    node.clearDirty();
  }

  private _mountDataNode(parent: SVGElement, node: SVGNode): SVGElement {
    const { svgTagName, svgAttr, childNodes } = node;
    const svgDom = this._createSVGElement(svgTagName, svgAttr);
    childNodes && childNodes.forEach(child => this._mountDataNode(svgDom, child));
    parent.appendChild(svgDom);
    return svgDom;
  }

  private _mountTextNode(svgText: SVGElement, spanList: TextSpan[]) {
    if (spanList.length === 1) {
      const textNode = document.createTextNode(spanList[0].text);
      svgText.appendChild(textNode);
    } else {
      spanList.forEach(span => {
        const tspan = this._createSVGElement('tspan', {x: span.x, y: span.y});
        const textNode = document.createTextNode(span.text);
        tspan.appendChild(textNode);
        svgText.appendChild(tspan);
      })
    }
  }

  private _updateNode(node: Element) {
    const svgDom = this._loadedSVGElements[node.id];
    this._setElementAttr(svgDom, node.getSvgAttributes());
    if (node.type === 'text') {
      svgDom.textContent = '';
      this._mountTextNode(svgDom, (node as Text).getSpanList());
    }
    if (node.attr.display && svgDom.getAttribute('display') === 'none') {
      svgDom.setAttribute('display', '');
    }

    if (!node.attr.clip && svgDom.getAttribute('clip-path')) {
      svgDom.removeAttribute('clip');
    }
    node.clearDirty();
  }

  private _removeNode(node: Element) {
    const el = this._loadedSVGElements[node.id];
    if (!el) {
      node.clearDirty();
      return;
    }
    if (node.isClip) {
      el.parentNode?.parentNode.removeChild(el.parentNode);
    } else {
      el.parentNode?.removeChild(el);
    }
    delete this._loadedSVGElements[node.id];
    node.clearDirty();
  }

  private _initSVGRoot() {
    const width = this.render.getWidth();
    const height = this.render.getHeight();
    const svgRoot = this._createSVGElement('svg', getSVGRootAttributes(width, height));
    const rootId = this.render.getRoot().id;
    const dfesElement = this._createSVGElement('defs', {}) as any;
    svgRoot.appendChild(dfesElement);
    this._svgRoot = svgRoot as any;
    this._svgDefElement = dfesElement;
    this.render.getDom().appendChild(svgRoot);
    this._loadedSVGElements[rootId] = svgRoot;
    this._mountNode(svgRoot, fpsRect);
    this._mountNode(svgRoot, fpsText);
    // todo default canvas context
  }

  private _paintChunk(parent: Group, chunk: Element[]) {
    parent.mountChunk(chunk);
    chunk.forEach(item => item.clearDirty());
    const svgElement = this._loadedSVGElements[parent.id];
    chunk.forEach(item => this._mountNode(svgElement, item));
  }

  private _createSVGElement(tagName: string, attributes: any): SVGElement {
    const el = document.createElementNS(SVG_NAMESPACE, tagName);
    this._setElementAttr(el, attributes);
    return el;
  }

  private _setElementAttr(el: SVGElement, attributes: any) {
    for (const key in attributes) {
      if (typeof attributes[key] !== 'undefined') {
        if (key !== 'xlink:href') {
          el.setAttribute(key, attributes[key]);
        } else {
          el.setAttributeNS(XLINK_NAMESPACE, 'xlink:href', attributes[key]);
        }
      }
    }
  }

  private _getAllDfsClips(group: Group) {
    group.eachChild(child => {
      const clip = child.getClipElement();
      if (clip) {
        this._defsClipElements.add(clip);
      }
      if (child.isGroup) {
        this._getAllDfsClips(child as Group);
      }
    });
  }

  private _getAllGradients(group: Group) {
    group.eachChild(child => {
      const { fill, stroke } = child.attr;

      if (isGradient(fill) || isPattern(fill)) {
        this._defsGradientsAndPatterns.add(fill as Gradient);
      }
      if (isGradient(stroke) || isPattern(stroke)) {
        this._defsGradientsAndPatterns.add(stroke as Gradient);
      }
      if (child.isGroup) {
        this._getAllGradients(child as Group);
      }
    });
  }

  private _getAllShadows(group: Group) {
    group.eachChild(child => {
      const { shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY } = child.attr;
      if (shadowColor && shadowBlur >= 0) {
        const shadow = child.getShadowObj();
        this._dfsShadows.add(shadow);
      }
      if (child.isGroup) {
        this._getAllShadows(child as Group);
      }
    });
  }

  private _drawFPS() {
    fpsText.setAttr('display', this.render.showFPS);
    fpsRect.setAttr('display', this.render.showFPS);
    const frameTimes = this._frameTimes;
    const startTime = frameTimes[0];
    const endTime = frameTimes[frameTimes.length - 1];
    if (endTime === startTime) {
      return;
    }
    const fps = Math.floor((frameTimes.length * 1000) / (endTime - startTime));
    fpsText.setAttr('text', fps + ' pfs');
    if (this._svgRoot.lastChild !== this._loadedSVGElements[fpsText.id]) {
      this._svgRoot.appendChild(this._loadedSVGElements[fpsRect.id]);
      this._svgRoot.appendChild(this._loadedSVGElements[fpsText.id]);
    }
    this._updateNode(fpsRect);
    this._updateNode(fpsText);
  }
}
registerPainter('svg', SVGPainter);
