import { getImage } from '../utils/imageLoader';

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
    this.id = 'pattern-' + id++;
  }

  public  getCanvasContextStyle(ctx: CanvasRenderingContext2D, onPatternReady: Function): CanvasPattern {
    const {image, repeat} = this.option;
    if (!this._pattern) {
      if (typeof image === 'string') {
        const result = getImage(image, ret => {
          this._pattern = ctx.createPattern(ret, repeat);
          onPatternReady();
        })
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
            } catch(err) {
              onPatternReady();
            }
          }
        }
      }
    }
    return this._pattern;
  }
}
