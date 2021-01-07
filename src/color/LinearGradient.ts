import Gradient, { GradientOption } from '../abstract/Gradient';
import { BBox } from '../utils/bbox';

export interface LinearGradientOption extends GradientOption {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default class LinearGradient implements Gradient<LinearGradientOption> {
  public option: LinearGradientOption;

  public getCanvasContextStyle(ctx: CanvasRenderingContext2D, rect: BBox): CanvasGradient {
    const option = this.option;
    const x1: number = option.x1 * rect.width + rect.x;
    const y1: number = option.y1 * rect.height + rect.y;
    const x2: number = option.x2 * rect.width + rect.x;
    const y2: number = option.y2 * rect.height + rect.y;
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    option.stops.map(stop => {
      gradient.addColorStop(stop.offset, stop.color);
    });
    return gradient;
  }

  public toCssString(): string {
    const option = this.option;
    const angle: number = Math.atan2(option.x1 - option.x2, option.y1 - option.y2);
    const stopStr: string = option.stops
      .map(stop => {
        return `${stop.color} ${stop.offset * 100}%`;
      })
      .join(', ');

    return `linear-gradient(${-angle}rad, ${stopStr})`;
  }
}
