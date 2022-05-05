/**
 * @author liwensheng
 */

import Shape from './Shape';
import { TextAttr } from './Text';
import { inBBox, createZeroBBox, BBox } from '../utils/bbox';
import { getDOMRenderer } from '../utils/dom-renderer';

const shapeKeys: Array<keyof TextAttr> = [
  'x',
  'y',
  'text',
  'fontSize',
  'fontFamily',
  'textAlign',
  'textBaseline',
  'fontWeight',
];

interface DOMNodeAttr extends Omit<TextAttr, 'text'> {
  text?: any;
  renderer?: string;
}

export default class DOMNode extends Shape<DOMNodeAttr> {

  public type: string = 'dom';

  public fillAble: boolean = false;

  public strokeAble: boolean = false;

  public shapeKeys = shapeKeys;

  protected _container: HTMLDivElement;

  protected _effectClear: Function;

  public getDefaultAttr(): Partial<DOMNodeAttr> {
    return {
      ...super.getDefaultAttr(),
      x: 0,
      y: 0,
      textAlign: 'left',
      textBaseline: 'top',
      renderer: 'html',
    }
  }

  public mounted() {
    super.mounted();
    if (!this._container) {
      this._container = document.createElement('div') as HTMLDivElement;
      this._container.className = "canvas-dom-layer"
    }
    if (this.ownerRender) {
      this.ownerRender.getDom().appendChild(this._container);
      this.update();
    }
  }

  public update() {
    const container = this._container;
    if (!container) {
      return;
    }
    const fontSize = this.getExtendAttr('fontSize') + 'px';
    const fontFamily = this.getExtendAttr('fontFamily');
    const fill = this.getExtendAttr('fill');
    const fontWeight = this.getExtendAttr('fontWeight');
    const pointerEvents = this.getExtendAttr('pointerEvents');
    const cursor = this.getExtendAttr('cursor');
    const textAlign = this.getExtendAttr('textAlign');
    const textBaseline = this.getExtendAttr('textBaseline');
    container.style.cssText = `line-height: 100%;position: absolute;font-size:${fontSize};font-family:${fontFamily};color:${fill};font-weight: ${fontWeight};pointer-events:${pointerEvents};cusor:${cursor}`;
    container.style.display = this.attr.display === false ? 'none' : 'block';
    this._setTransform();
    if (textAlign === 'left') {
      container.style.left = this.attr.x + 'px';
      container.style.right = 'auto';
    } else if (textAlign === 'right') {
      container.style.left = 'auto';
      container.style.right = (this.ownerRender.getWidth() - this.attr.x) + 'px';
    }

    if (textBaseline === 'top') {
      container.style.top = this.attr.y + 'px'
      container.style.bottom = 'auto';
    } else if (textBaseline === 'bottom') {
      container.style.top = 'auto';
      container.style.bottom = (this.ownerRender.getHeight() - this.attr.y) + 'px'
    }
    if (textAlign === 'center' || textBaseline === 'middle') {
      requestAnimationFrame(() => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (textAlign === 'center') {
          container.style.left = (this.attr.x - width / 2) + 'px';
        }
        if (textBaseline === 'middle') {
          container.style.top = (this.attr.y - height / 2) + 'px';
        }
      })
    }
    this.clearContent();
    this.renderContent();
  }

  public destroy() {
    super.destroy();
    this.clearContent();
    this._container.parentNode.removeChild(this._container);
    this._effectClear = null;
  }

  public dirtyGlobalTransform() {
    super.dirtyGlobalTransform();
    this._setTransform();
  }

  public getContainer() {
    return this._container;
  }

  protected renderContent() {
    const renderer = getDOMRenderer(this.attr.renderer);
    this._effectClear = renderer(this._container, this.attr.text);
  }
  
  protected clearContent() {
    this._effectClear && this._effectClear();
  }

  protected isPointOnPath(x: number, y: number): boolean {
    return inBBox(this.getBBox(), x, y);
  }

  protected computeBBox() {
    if (!this._container) {
      return createZeroBBox();
    }
    const { x, y } = this.attr;
    const textAlign = this.getExtendAttr('textAlign');
    const textBaseline = this.getExtendAttr('textBaseline');
    const textWidth = this._container.clientWidth;
    const textHeight = this._container.clientHeight;
    const bbox: BBox = {
      x,
      y,
      width: textWidth,
      height: textHeight,
    };

    if (textAlign === 'center') {
      bbox.x = x - textWidth / 2;
    } else if (textAlign === 'right') {
      bbox.x = x - textWidth;
    }

    if (textBaseline === 'top') {
      bbox.y = y;
    } else if (textBaseline === 'middle') {
      bbox.y = y - textHeight / 2;
    } else {
      bbox.y = y - textHeight;
    }
    return bbox;
  }

  private _setTransform() {
    const { x, y } = this.attr;
    const container = this._container;
    if (!container) {
      return;
    }
    const textAlign = this.getExtendAttr('textAlign');
    const textBaseline = this.getExtendAttr('textBaseline');
    const matrix = this.getGlobalTransform();
    const transform = [matrix[0], matrix[1], matrix[3], matrix[4], matrix[6], matrix[7]];
    const originMap: any = {
      left: `${-x}px`,
      center: `calc(${-x}px + 50%)`,
      right: `calc(${-x}px + 100%)`,
      top: `${-y}px`,
      middle: `calc(${-y}px + 50%)`,
      bottom: `calc(${-y}px + 100%)`,
    };
    const cssMatrix = `matrix(${transform.join(',')})`;
    container.style.transform = cssMatrix;
    container.style.transformOrigin = `${originMap[textAlign]} ${originMap[textBaseline]}`;
  }
}