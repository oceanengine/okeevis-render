import Gradient, { GradientOption, GradientType } from '../abstract/Gradient';
import { BBox } from '../utils/bbox';
import SVGNode from '../abstract/Node';
import { dot, normalize, add, scale, Vec2 } from '../utils/vec2';
import { minBy, maxBy, isNumber, cloneDeep } from '../utils/lodash';
import type { GradientPoints } from './css-gradient-parser';
export interface LinearGradientOption extends GradientOption {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  angle?: number;
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
    return new LinearGradient(cloneDeep(this.option));
  }

  public getCanvasContextStyle(ctx: CanvasRenderingContext2D, rect: BBox): CanvasGradient {
    const option = this.option;
    const angleMode = isNumber(option.angle);
    const widthRatio = angleMode ? 1 : rect.width;
    const heightRatio = angleMode ? 1 : rect.height;
    if (angleMode) {
      const [p1, p2] = getPointByAngle(option.angle + Math.PI /2, rect.width, rect.height);
      option.x1 = p1[0];
      option.y1 = p1[1];
      option.x2 = p2[0];
      option.y2 = p2[1];
    }
    const x1: number = option.global ? option.x1 : option.x1 * widthRatio + rect.x;
    const y1: number = option.global ? option.y1 : option.y1 * heightRatio + rect.y;
    const x2: number = option.global ? option.x2 : option.x2 * widthRatio + rect.x;
    const y2: number = option.global ? option.y2 : option.y2 * heightRatio + rect.y;
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


export function getPointByAngle(angle: number, width: number, height: number): GradientPoints {
  const vecLine: Vec2 = [Math.cos(angle), Math.sin(angle)];
  const projectPoints = [
    [0, 0],
    [0, height],
    [width, 0],
    [width, height],
  ].map(point => {
    const vec: Vec2 = [point[0] - 0.5 * width, point[1] - 0.5 * height];
    const projectLen = dot(vec, vecLine);
    const normalizeVec2 = normalize([0, 0], vecLine);
    const vec2: Vec2 = scale(normalizeVec2, normalizeVec2, projectLen);
    const res: Vec2 = [0.5 * width, 0.5 * height];
    add(res, res, vec2);
    return res;
  });
  const minByIndex = Math.abs(Math.sin(angle)) < 1e-6 ? 0 : 1;
  const minPoint = minBy(projectPoints, point => point[minByIndex]);
  const maxPoint = maxBy(projectPoints, point => point[minByIndex]);
  const atanValue = Math.atan2(maxPoint[1] - minPoint[1], maxPoint[0] - minPoint[0],);
  if (!sameSymbol(atanValue, Math.atan2(Math.sin(angle), Math.cos(angle)))) {
    return [minPoint, maxPoint]
  } else {
    return [maxPoint, minPoint];
  }
}

function sameSymbol(a: number, b: number) {
  if (a >= 0) {
      return b >= 0;
  }
  if (a <= 0) {
      return b <= 0
  }
}
