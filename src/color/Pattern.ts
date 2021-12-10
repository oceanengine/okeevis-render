import { getImage } from '../utils/imageLoader';
import SVGNode from '../abstract/Node';

export interface PatternOption {
  image: CanvasImageSource | string;
  repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
}

let id = 1;
/**
 * pattern
 */
export default class Pattern {
  public type = 'pattern';

  public option: PatternOption;

  public id: string;

  private _pattern: CanvasPattern;

  public constructor(conf: PatternOption) {
    this.option = conf;
    this.id = 'okee-render-pattern-' + id++;
  }

  public getCanvasContextStyle(
    ctx: CanvasRenderingContext2D,
    onPatternReady: Function,
  ): CanvasPattern {
    const { image, repeat } = this.option;
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
              onPatternReady();
            } catch (err) {
              onPatternReady();
            }
          };
        }
      }
    }
    return this._pattern;
  }

  public getSVGNode(): SVGNode {
    const { image } = this.option;
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
}
