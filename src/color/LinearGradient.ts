import Gradient, { GradientOption, GradientType } from '../abstract/Gradient';
import * as lodash from '../utils/lodash';
import { BBox } from '../utils/bbox';
import SVGNode from '../abstract/Node';

export interface LinearGradientOption extends GradientOption {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}
const defaultOption: LinearGradientOption = {
  x1: 0,
  y1: 0,
  x2: 1,
  y2: 0,
  stops: [],
};

export default class LinearGradient extends Gradient<LinearGradientOption> {

  public type: GradientType = 'linearGradient';

  public option: LinearGradientOption;

  public constructor(option: LinearGradientOption) {
    super({ ...defaultOption, ...option });
  }

  public clone(): LinearGradient {
    return new LinearGradient(lodash.cloneDeep(this.option));
  }

  public getCanvasContextStyle(ctx: CanvasRenderingContext2D, rect: BBox): CanvasGradient {
    const option = this.option;
    const x1: number = option.global ? option.x1 : option.x1 * rect.width + rect.x;
    const y1: number = option.global ? option.y1 : option.y1 * rect.height + rect.y;
    const x2: number = option.global ? option.x2 : option.x2 * rect.width + rect.x;
    const y2: number = option.global ? option.y2 : option.y2 * rect.height + rect.y;
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    option.stops.forEach(stop => {
      gradient.addColorStop(stop.offset, stop.color);
    });
    return gradient;
  }

  public getSVGNode(): SVGNode {
    const { x1, y1, x2, y2, stops, global } = this.option;
    return {
      svgTagName: 'linearGradient',
      svgAttr: {
        gradientUnits: global ? 'userSpaceOnUse' : 'objectBoundingBox',
        id: this.id,
        x1,
        y1,
        x2,
        y2,
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

  public toString(): string {
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
