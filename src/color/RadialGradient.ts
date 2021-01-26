import Gradient, { GradientOption } from '../abstract/Gradient';
import * as lodash from '../utils/lodash';
import { BBox } from '../utils/bbox';
import SVGNode from '../abstract/Node';

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

export default class RadialGradient extends Gradient<RadialGradientOption> {
  public type = 'radialGradient';

  public option: RadialGradientOption;

  public constructor(option: RadialGradientOption) {
    super({ ...defaultOption, ...option });
  }

  public clone(): RadialGradient {
    return new RadialGradient(lodash.cloneDeep(this.option));
  }

  public getCanvasContextStyle(ctx: CanvasRenderingContext2D, rect: BBox): CanvasGradient {
    const option = this.option;
    const min: number = Math.min(rect.width, rect.height);
    const x1: number = option.cx * rect.width + rect.x;
    const y1: number = option.cy * rect.height + rect.y;
    const r1: number = min * option.r;
    const x2: number = x1;
    const y2: number = y1;
    const gradient: CanvasGradient = ctx.createRadialGradient
      ? ctx.createRadialGradient(x1, y1, 0, x2, y2, r1)
      : ctx.createCircularGradient(x1, y1, r1);
    option.stops.forEach(stop => {
      gradient.addColorStop(stop.offset, stop.color);
    });
    return gradient;
  }

  public getSVGNode(): SVGNode {
    const { cx, cy, r, stops } = this.option;
    return {
      svgTagName: 'radialGradient',
      svgAttr: {
        id: this.id,
        cx,
        cy,
        r,
      },
      childNodes: stops.map(stop => {
        return {
          svgTagName: 'stop',
          svgAttr: {
            offset: stop.offset * 100 + '%',
            'stop-color': stop.color,
          },
        };
      }),
    };
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
