import { getImage } from '../utils/imageLoader';

export interface PatternOption {
  image: CanvasImageSource | string;
  repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
}


/**
 * pattern
 */
export default class Pattern {
  public type = 'pattern';

  public option: PatternOption;

  private _pattern: CanvasPattern;

  public constructor(conf: PatternOption) {
    this.option = conf;
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
      } else {
        this._pattern = ctx.createPattern(image, repeat);
      }
    }
    return this._pattern;
  }
}
