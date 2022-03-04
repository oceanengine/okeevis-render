import Gradient, { GradientOption } from '../abstract/Gradient';
import * as lodash from '../utils/lodash';
import SVGNode from '../abstract/Node';

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

export default class LinearGradient extends Gradient<ConicGradientOption> {
  public type = 'conic-gradient';

  public option: ConicGradientOption;

  public constructor(option: ConicGradientOption) {
    super({ ...defaultOption, ...option });
  }

  public clone(): LinearGradient {
    return new LinearGradient(lodash.cloneDeep(this.option));
  }

  public getCanvasContextStyle(): CanvasGradient {
    return null;
  }

  public getSVGNode(): SVGNode {
    return null;
  }

  public toString(): string {
   return '';
  }
}
