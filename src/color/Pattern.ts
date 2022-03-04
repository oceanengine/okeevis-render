import { getImage } from '../utils/imageLoader';
import SVGNode from '../abstract/Node';
import Element from '../shapes/Element';
import Render from '../render';

export interface PatternOption {
  image?: CanvasImageSource | string;
  width?: number;
  height?: number;
  element: Element | Element[];
  repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
}

let id = 1;
let patternCanvas: HTMLCanvasElement;

export default class Pattern {
  public type = 'pattern';

  public isPattern = true;

  public option: PatternOption;

  public id: string;

  private _pattern: CanvasPattern;

  public constructor(conf: PatternOption) {
    this.option = conf;
    this.id = 'okee-render-pattern-' + id++;
  }

  public isReady(): boolean {
    return !!this._pattern;
  }

  public getCanvasContextStyle(
    ctx: CanvasRenderingContext2D,
    onPatternReady: Function,
  ): CanvasPattern {
    const { image, repeat, element, width, height } = this.option;
    if (!this._pattern) {
      if (typeof image === 'string') {
        const result = getImage(image, this.id, ret => {
          this._pattern = ctx.createPattern(ret, repeat);
          onPatternReady();
        });
        if (result) {
          this._pattern = ctx.createPattern(result, repeat);
          onPatternReady();
        }
      } else if (image instanceof HTMLImageElement) {
        if (image.complete) {
          this._pattern = ctx.createPattern(image, repeat);
        } else {
          image.onload = () => {
            try {
              this._pattern = ctx.createPattern(image, repeat);
              this._pattern.setTransform()
              onPatternReady();
            } catch (err) {
              onPatternReady();
            }
          };
        }
      } else if (element) {
        const canvas = patternCanvas ?? document.createElement('canvas');
        const render = new Render(canvas);
        const dpr = render.dpr;
        render.resize(width, height);
        if (Array.isArray(element)) {
          render.addAll(element);
        } else {
          render.add(element);
        }
        render.refreshImmediately();
        render.dispose();
        const patterImage = new Image(width, height);
        const dataURL = canvas.toDataURL();
        patterImage.onload = () => {
          this._pattern = ctx.createPattern(patterImage, 'repeat');
          if (this._pattern.setTransform) {
            const matrix = new DOMMatrix([1 / dpr, 0, 0, 1 / dpr, 0, 0]);
            this._pattern.setTransform(matrix);
          }
          onPatternReady();
        }
        patterImage.src = dataURL;
      }
    }
    return this._pattern;
  }

  public getSVGNode(): SVGNode {
    const { image, element } = this.option;
    if (image) {
      const { width, height, src } = image as HTMLImageElement;
      return {
        svgTagName: 'pattern',
        svgAttr: {
          id: this.id,
          x: 0,
          y: 0,
          width,
          height,
          patternUnits: 'userSpaceOnUse', // 'objectBoundingBox',
        },
        childNodes: [
          {
            svgTagName: 'image',
            svgAttr: {
              'xlink:href': src,
              x: 0,
              y: 0,
              width,
              height,
            },
          },
        ],
      };
    }
    if (element) {
      const nodes = Array.isArray(element) ? element : [element];
      const { width, height } = this.option;
      return {
        svgTagName: 'pattern',
        svgAttr: {
          id: this.id,
          x: 0,
          y: 0,
          width,
          height,
          patternUnits: 'userSpaceOnUse', // 'objectBoundingBox',
        },
        childNodes: nodes.map(node => this._getNodeData(node))
      };
    }
  }

  private _getNodeData(node: Element): SVGNode {
    return {
      svgTagName: node.svgTagName,
      svgAttr: node.getSvgAttributes(),
      childNodes: node.childNodes.map(subNode => this._getNodeData(subNode)),
    }
  }
}
