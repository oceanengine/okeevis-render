export interface PatternOption {
  image: CanvasImageSource;
  repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
}

/**
 * pattern
 */
export default class Pattern {
  public option: PatternOption;

  public constructor(conf: PatternOption) {
    this.option = conf;
  }

  public  getCanvasContextStyle(ctx: CanvasRenderingContext2D): CanvasPattern {
    return ctx.createPattern(this.option.image, this.option.repeat);
  }

}
