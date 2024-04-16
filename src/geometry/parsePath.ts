/* eslint-disable */

enum canvasAPI {
  MOVE_TO = 'moveTo',
  LINE_TO = 'lineTo',
  ARC_TO = 'arcTo',
  BEZIER_CURVE_TO = 'bezierCurveTo',
  QUADRATIC_CURVE_TO = 'quadraticCurveTo',
  CLOSE_PATH = 'closePath',
  ELLIPSE = 'ellipse',
  RECT = 'rect',
}

export interface PathRecord {
  action: string;
  params: number[];
}
enum svgPathCommand {
  M = 'M',
  L = 'L',
  H = 'H',
  V = 'V',
  C = 'C',
  S = 'S',
  Q = 'Q',
  T = 'T',
  A = 'A',
  Z = 'Z',
  m = 'm',
  l = 'l',
  h = 'h',
  v = 'v',
  c = 'c',
  s = 's',
  q = 'q',
  t = 't',
  a = 'a',
  z = 'z',
}
const svgCommandParamSize: { [key: string]: number } = {
  m: 2,
  l: 2,
  h: 1,
  v: 1,
  c: 6,
  s: 4,
  q: 4,
  t: 2,
  a: 7,
  z: 0,
};

enum expectType {
  NUMBER,
  COMMAND,
  ANY,
}

const svgCommandList: string[] = ['m', 'l', 'h', 'v', 'c', 's', 'q', 't', 'a', 'z'];

function getSymmetricPoint(x: number, y: number, cx: number, cy: number): number[] {
  return [cx * 2 - x, cy * 2 - y];
}
export default function parsePathString(inputPath: string): PathRecord[] {
  // tslint:disable
  const pathString: string = inputPath.trim();
  const pathStack: PathRecord[] = [];
  let currentCommand: string;
  let currentParams: number[] = [];
  let bufferedNumberString: string = '';
  let isNumbering: boolean = false;
  let currentExpect: expectType = expectType.COMMAND;
  let expectParamSize: number = 0;
  const strLen: number = pathString.length;
  const regLetter: RegExp = /[a-z]/i;
  const regWhiteSpace: RegExp = /\s/i;
  const regNumber: RegExp = /\d/i;

  function pushParsedNumber(): void {
    const value: number = parseFloat(bufferedNumberString);
    if (isNaN(value)) {
      throw new Error('Error: NaN');
    }
    currentParams.push(value);
  }
  function pushStack(): void {
    if (currentCommand) {
      // the first command must be m or M
      if (pathStack.length === 0 && currentCommand.toLocaleLowerCase() !== svgPathCommand.m) {
        throw new Error('path should start with M or m');
      }
      const pathItem: PathRecord = {
        action: currentCommand,
        params: currentParams,
      };
      expectParamSize = svgCommandParamSize[currentCommand.toLocaleLowerCase()];
      if (expectParamSize !== currentParams.length) {
        const count = currentParams.length / expectParamSize;
        for (let i = 0; i < count; i++) {
          console.log(currentCommand)
          pathStack.push({
            action: currentCommand,
            params: currentParams.slice(i * expectParamSize, (i + 1) * expectParamSize)
          });
        }
      }
      pathStack.push(pathItem);
    }
  }
  for (let i: number = 0; i < strLen; i += 1) {
    const currentStr: string = pathString[i];
    const isLetter: boolean = regLetter.test(currentStr); //
    const isWhiteSpace: boolean = regWhiteSpace.test(currentStr);
    const isComma: boolean = currentStr === ',';
    const isDot: boolean = currentStr === '.';
    const isE: boolean = currentStr === 'e' || currentStr === 'E';
    const isNegativeSymbol: boolean = currentStr === '-';
    const isNumber: boolean = regNumber.test(currentStr);
    const isEnd: boolean = i === strLen - 1;
    if (isLetter && !isE) {
      if (currentExpect === expectType.NUMBER) {
        throw new Error(`Error path, Expected number, ${pathString.slice(0, i)}`);
      }
      const isSvgPathCommand: boolean = svgCommandList.indexOf(currentStr.toLowerCase()) !== -1;
      if (isSvgPathCommand) {
        if (isNumbering) {
          pushParsedNumber();
        }
        pushStack();
        isNumbering = false;
        bufferedNumberString = '';
        currentCommand = currentStr;
        expectParamSize = svgCommandParamSize[currentCommand];
        currentParams = [];
        if (currentCommand === svgPathCommand.z || currentCommand === svgPathCommand.Z) {
          currentExpect = expectType.COMMAND;
        } else {
          currentExpect = expectType.NUMBER;
          bufferedNumberString = '';
        }
      } else {
        throw new Error('illegal path command');
      }
    } else if (isNumber || isDot || isNegativeSymbol || isE) {
      if (currentExpect === expectType.COMMAND) {
        throw new Error('Error path, Expexct ');
      }
      if (isNumbering && isNegativeSymbol) {
        pushParsedNumber();
        bufferedNumberString = '';
      }
      isNumbering = true;
      bufferedNumberString += currentStr;
      currentExpect = expectType.ANY;
    } else if (isWhiteSpace) {
      if (isNumbering) {
        pushParsedNumber();
        bufferedNumberString = '';
        isNumbering = false;
      } else {
        continue;
      }
    } else if (isComma) {
      if (!isNumbering && currentParams.length === 0) {
        throw new Error('Error, excpected number');
      }
      if (isNumbering) {
        pushParsedNumber();
        isNumbering = false;
      }
      bufferedNumberString = '';
    } else {
      throw new Error('illegal string in path');
    }
    if (isEnd) {
      if (isNumbering) {
        pushParsedNumber();
      }
      pushStack();
    }
  }

  return getCanvasActions(pathStack);
}

function getCanvasActions(recordList: PathRecord[]): PathRecord[] {
  let startX: number = 0;
  let startY: number = 0;
  let endX: number = 0;
  let endY: number = 0;
  let prevBezierCurveX2: number = 0;
  let prevBezierCurveY2: number = 0;
  let prevQuadraticCurveCpx: number = 0;
  let prevQuadraticCurveCpy: number = 0;

  return recordList.map((record: PathRecord) => {
    // tslint:disable
    // too much swtich case
    const { action, params } = record;
    let canvasAPIName: string = '';
    let canvasAPIParams: number[] = [];
    switch (action) {
      case svgPathCommand.M:
        endX = params[0];
        endY = params[1];
        startX = endX;
        startY = endY;
        canvasAPIName = canvasAPI.MOVE_TO;
        canvasAPIParams = [endX, endY];
        break;
      case svgPathCommand.m:
        endX += params[0];
        endY += params[1];
        startX = endX;
        startY = endY;
        canvasAPIName = canvasAPI.MOVE_TO;
        canvasAPIParams = [endX, endY];
        break;
      case svgPathCommand.L:
        endX = params[0];
        endY = params[1];
        canvasAPIName = canvasAPI.LINE_TO;
        canvasAPIParams = [endX, endY];
        break;
      case svgPathCommand.l:
        endX += params[0];
        endY += params[1];
        canvasAPIName = canvasAPI.LINE_TO;
        canvasAPIParams = [endX, endY];
        break;
      case svgPathCommand.H:
        endX = params[0];
        canvasAPIName = canvasAPI.LINE_TO;
        canvasAPIParams = [endX, endY];
        break;
      case svgPathCommand.h:
        endX += params[0];
        canvasAPIName = canvasAPI.LINE_TO;
        canvasAPIParams = [endX, endY];
        break;
      case svgPathCommand.V:
        endY = params[0];
        canvasAPIName = canvasAPI.LINE_TO;
        canvasAPIParams = [endX, endY];
        break;
      case svgPathCommand.v:
        endY += params[0];
        canvasAPIName = canvasAPI.LINE_TO;
        canvasAPIParams = [endX, endY];
        break;
      case svgPathCommand.C:
        canvasAPIName = canvasAPI.BEZIER_CURVE_TO;
        endX = params[4];
        endY = params[5];
        canvasAPIParams = params.slice();
        prevBezierCurveX2 = params[2];
        prevBezierCurveY2 = params[3];
        break;
      case svgPathCommand.c:
        canvasAPIName = canvasAPI.BEZIER_CURVE_TO;
        canvasAPIParams = [
          params[0] + endX,
          params[1] + endY,
          params[2] + endX,
          params[3] + endY,
          params[4] + endX,
          params[5] + endY,
        ];
        endX = canvasAPIParams[4];
        endY = canvasAPIParams[5];
        prevBezierCurveX2 = canvasAPIParams[2];
        prevBezierCurveY2 = canvasAPIParams[3];
        break;
      case svgPathCommand.S:
        canvasAPIName = canvasAPI.BEZIER_CURVE_TO;
        const [Sx1, Sy1] = getSymmetricPoint(prevBezierCurveX2, prevBezierCurveY2, endX, endY);
        canvasAPIParams = [Sx1, Sy1, params[0], params[1], params[2], params[3]];
        endX = canvasAPIParams[4];
        endY = canvasAPIParams[5];
        prevBezierCurveX2 = params[0];
        prevBezierCurveY2 = params[1];
        break;
      case svgPathCommand.s:
        canvasAPIName = canvasAPI.BEZIER_CURVE_TO;
        const [sx1, sy1] = getSymmetricPoint(prevBezierCurveX2, prevBezierCurveY2, endX, endY);
        canvasAPIParams = [
          sx1,
          sy1,
          params[0] + endX,
          params[1] + endY,
          endX + params[2],
          endY + params[3],
        ];
        endX = canvasAPIParams[4];
        endY = canvasAPIParams[5];
        prevBezierCurveX2 = params[0];
        prevBezierCurveY2 = params[1];
        break;
      case svgPathCommand.Q:
        canvasAPIName = canvasAPI.QUADRATIC_CURVE_TO;
        canvasAPIParams = params.slice();
        endX = params[2];
        endY = params[3];
        prevQuadraticCurveCpx = params[0];
        prevQuadraticCurveCpy = params[1];
        break;
      case svgPathCommand.q:
        canvasAPIName = canvasAPI.QUADRATIC_CURVE_TO;
        canvasAPIParams = [endX + params[0], endY + params[1], endX + params[2], endY + params[3]];
        endX = canvasAPIParams[2];
        endY = canvasAPIParams[3];
        prevQuadraticCurveCpx = canvasAPIParams[0];
        prevQuadraticCurveCpy = canvasAPIParams[1];
        break;
      case svgPathCommand.T:
        canvasAPIName = canvasAPI.QUADRATIC_CURVE_TO;
        const [Tx1, Ty1] = getSymmetricPoint(
          prevQuadraticCurveCpx,
          prevQuadraticCurveCpy,
          endX,
          endY,
        );
        canvasAPIParams = [Tx1, Ty1, params[0], params[1]];
        endX = canvasAPIParams[2];
        endY = canvasAPIParams[3];
        prevQuadraticCurveCpx = canvasAPIParams[0];
        prevQuadraticCurveCpy = canvasAPIParams[1];
        break;
      case svgPathCommand.t:
        canvasAPIName = canvasAPI.QUADRATIC_CURVE_TO;
        const [tx1, ty1] = getSymmetricPoint(
          prevQuadraticCurveCpx,
          prevQuadraticCurveCpy,
          endX,
          endY,
        );
        canvasAPIParams = [tx1, ty1, params[0] + endX, params[1] + endY];
        endX = canvasAPIParams[2];
        endY = canvasAPIParams[3];
        prevQuadraticCurveCpx = canvasAPIParams[0];
        prevQuadraticCurveCpy = canvasAPIParams[1];
        break;
      case svgPathCommand.A:
        canvasAPIName = canvasAPI.ELLIPSE;
        canvasAPIParams = conversionFromEndPointToCenterParameterization.apply(
          null,
          [endX, endY].concat(params),
        );
        endX = params[5];
        endY = params[6];
        break;
      case svgPathCommand.a:
        canvasAPIName = canvasAPI.ELLIPSE;
        canvasAPIParams = conversionFromEndPointToCenterParameterization.apply(
          null,
          [endX, endY].concat([
            params[0],
            params[1],
            params[2],
            params[3],
            params[4],
            params[5] + endX,
            params[6] + endY,
          ]),
        );
        endX += params[5];
        endY += params[6];
        break;
      case svgPathCommand.Z:
        canvasAPIName = canvasAPI.CLOSE_PATH;
        canvasAPIParams = [];
        endX = startX;
        endY = startY;
        break;
      case svgPathCommand.z:
        canvasAPIName = canvasAPI.CLOSE_PATH;
        endX = startX;
        endY = startY;
        canvasAPIParams = [];
        break;
      default:
        throw new Error('unknow command');
    }
    return { action: canvasAPIName, params: canvasAPIParams };
  });
}

function radian(ux: number, uy: number, vx: number, vy: number): number {
  const dot: number = ux * vx + uy * vy;
  const mod: number = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
  let rad = Math.acos(dot / mod);
  if (ux * vy - uy * vx < 0.0) {
    rad = -rad;
  }
  return rad;
}

function conversionFromEndPointToCenterParameterization(
  x1: number,
  y1: number,
  rx: number,
  ry: number,
  xAxisRotation: number,
  fA: number,
  fS: number,
  x2: number,
  y2: number,
): any {
  const phi = (Math.PI * xAxisRotation) / 180;
  let cx: number = 0;
  let cy: number = 0;
  let theta1: number = 0;
  let delta_theta: number = 0;
  if (rx == 0.0 || ry == 0.0) {
    return -1;
  }
  const s_phi: number = Math.sin(phi);
  const c_phi: number = Math.cos(phi);
  const hd_x: number = (x1 - x2) / 2.0; // half diff of x
  const hd_y: number = (y1 - y2) / 2.0; // half diff of y
  const hs_x: number = (x1 + x2) / 2.0; // half sum of x
  const hs_y: number = (y1 + y2) / 2.0; // half sum of y

  // F6.5.1
  const x1_ = c_phi * hd_x + s_phi * hd_y;
  const y1_ = c_phi * hd_y - s_phi * hd_x;

  const rxry = rx * ry;
  const rxy1_ = rx * y1_;
  const ryx1_ = ry * x1_;
  const sum_of_sq = rxy1_ * rxy1_ + ryx1_ * ryx1_; // sum of square
  let coe = Math.sqrt(Math.abs((rxry * rxry - sum_of_sq) / sum_of_sq));
  if (fA == fS) {
    coe = -coe;
  }

  // F6.5.2
  const cx_ = (coe * rxy1_) / ry;
  const cy_ = (-coe * ryx1_) / rx;

  // F6.5.3
  cx = c_phi * cx_ - s_phi * cy_ + hs_x;
  cy = s_phi * cx_ + c_phi * cy_ + hs_y;

  const xcr1 = (x1_ - cx_) / rx;
  const xcr2 = (x1_ + cx_) / rx;
  const ycr1 = (y1_ - cy_) / ry;
  const ycr2 = (y1_ + cy_) / ry;

  // F6.5.5
  theta1 = radian(1.0, 0.0, xcr1, ycr1);

  // F6.5.6
  delta_theta = radian(xcr1, ycr1, -xcr2, -ycr2);
  const PIx2 = Math.PI * 2;
  while (delta_theta > PIx2) delta_theta -= PIx2;
  while (delta_theta < 0.0) delta_theta += PIx2;
  if (fS === 0) delta_theta -= PIx2;
  return [cx, cy, rx, ry, phi, theta1, theta1 + delta_theta, 1 - fS];
}
