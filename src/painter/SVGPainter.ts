import Painter from '../abstract/Painter';
import Render from '../render';
import Group from '../shapes/Group';
import Element, { defaultCanvasContext, } from '../shapes/Element';
import { SVG_NAMESPACE, XLINK_NAMESPACE } from '../constant';


export default class SVGPainter implements Painter {
  public render: Render;

  private _svgRoot: HTMLElement;

  private _isFirstFrame: boolean = false;

  private _loadedSVGElements: Record<number, SVGElement> = {};

  private _canvas: HTMLCanvasElement;

  public constructor(render: Render) {
    this.render = render;
    this._initSVGRoot();
  }

  public resize(width: number, height: number) {
    this._svgRoot.setAttribute('width', width + 'px');
    this._svgRoot.setAttribute('height', height + 'px');
  }

  public onFrame() {
    if (this.render.needUpdate()) {
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
          } else {
            const parentNode = dirtyNode.parentNode;
            this._mountNode(this._loadedSVGElements[parentNode.id], dirtyNode);
          }
        })
      }
    }
    const allChunks = this.render.getAllChunks();
    if (allChunks.length > 0) {
      const { parent, chunks } = allChunks[0];
      this._paintChunk(parent, chunks[0]);
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

  public dispose() {
    delete this._loadedSVGElements;
    this._svgRoot.parentNode.removeChild(this._svgRoot);
    this._canvas = null;
  }

  private _mountNode(parent: SVGElement, node: Element) {
    if (this._loadedSVGElements[node.id]) {
      return;
    }
    const tagName = node.svgTagName;
    const attributes = node.getSvgAttributes();
    const id = node.id;
    const svgDom =  this._createSVGElement(tagName, attributes);
    this._loadedSVGElements[id] = svgDom;
    parent.appendChild(svgDom);
    if (node.isGroup) {
      (node as Group).eachChild(child => this._mountNode(svgDom, child));
    }
  }

  private _updateNode(node: Element) {
    this._setElementAttr(this._loadedSVGElements[node.id], node.getSvgAttributes());
  }

  private _removeNode(node: Element) {
    const el = this._loadedSVGElements[node.id];
    el.parentNode.removeChild(el);
    delete this._loadedSVGElements[node.id];
  }

  private _initSVGRoot() {
    const width = this.render.getWidth();
    const height = this.render.getHeight();
    const svgRoot = document.createElement('svg');
    svgRoot.setAttribute('width', width + 'px');
    svgRoot.setAttribute('height', height + 'px');
    this._svgRoot = svgRoot;
    // todo default canvas context
  }

  private _paintChunk(parent: Group, chunk: Element[]) {
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

  private _drawFPS() {
    
  }
}
