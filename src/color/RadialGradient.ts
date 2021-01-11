import Gradient, { GradientOption } from '../abstract/Gradient';
import { BBox } from '../utils/bbox';

export interface RadialGradientOption extends GradientOption {
  cx?: number;
  cy?: number;
  r?: number;
}

const defaultOption: RadialGradientOption = {
  cx: 0.5,
  cy: 0.5,
  r: 1,
  stops: [],
};

export default class RadialGradient implements Gradient<RadialGradientOption> {
  public type = 'radialGradient';

  public option: RadialGradientOption;

  public constructor(option: RadialGradientOption) {
    this.option = { ...defaultOption, ...option };
  }

  public getCanvasContextStyle(ctx: CanvasRenderingContext2D, rect: BBox): CanvasGradient {
    const option = this.option;
    const min: number = Math.min(rect.width, rect.height);
    const x1: number = option.cx * rect.width + rect.x;
    const y1: number = option.cy * rect.height + rect.y;
    const r1: number = min * option.r;
    const x2: number = x1
    const y2: number = y1;
    const gradient: CanvasGradient = ctx.createRadialGradient(x1, y1, 0, x2, y2, r1);
    option.stops.forEach(stop => {
      gradient.addColorStop(stop.offset, stop.color);
    });
    return gradient;
  }

  public toCssString(): string {
    const { cx, cy, stops } = this.option;
    // TODO 有结束参数的实现上有问题
    const stopStr = stops
      .map(stop => {
        return `${stop.color} ${stop.offset * 100}%`;
      })
      .join(', ');

    return `radial-gradient(circle at ${cx * 100}% ${cy * 100}%,  ${stopStr})`;
  }
}
