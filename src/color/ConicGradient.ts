import Gradient, { GradientOption, GradientType } from '../abstract/Gradient';
import * as lodash from '../utils/lodash';
import { BBox } from '../utils/bbox';
import SVGNode from '../abstract/Node';
import { isMobile } from '../utils/env';

export interface ConicGradientOption extends GradientOption {
  cx?: number;
  cy?: number;
  startAngle?: number; // rad
}
const defaultOption: ConicGradientOption = {
  cx: 0.5,
  cy: 0.5,
  startAngle: 0,
  stops: [],
};

export default class ConicGradient extends Gradient<ConicGradientOption> {
  public type: GradientType= 'conicGradient';

  public option: ConicGradientOption;

  public constructor(option: ConicGradientOption) {
    super({ ...defaultOption, ...option });
  }

  public clone(): ConicGradient {
    return new ConicGradient(lodash.cloneDeep(this.option));
  }

  public getCanvasContextStyle(ctx: CanvasRenderingContext2D, rect: BBox): CanvasGradient {
    const option = this.option;
    const cx = option.global ? option.cx : (rect.x + rect.width * this.option.cx);
    const cy = option.global ? option.cy : (rect.y + rect.height * this.option.cy);
    if (!ctx.createConicGradient) {
      return 'rgba(0, 0, 0, 0)' as any;
    }
    const gradient = ctx.createConicGradient(this.option.startAngle + (isMobile ? Math.PI / 2 : 0), cx, cy);
    option.stops.forEach(stop => {
      gradient.addColorStop(stop.offset, stop.color);
    });
    return gradient;
  }

  public getSVGNode(): SVGNode {
    return {
      svgTagName: 'conic-gradient',
      svgAttr: {}
    };
  }

  public toString(): string {
   return '';
  }
}
