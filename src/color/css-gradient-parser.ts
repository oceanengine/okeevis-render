/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient
 * angle:  45deg/turn/rad/grad |  | to left  (default to bottom)  0 means to top
 * color-stops: #33,  red 10%, orange 25%, yellow 50% 70%, orange;
 */

import Gradient, { ColorStop } from '../abstract/Gradient';
import LinearGradient from './LinearGradient';
import RadialGradient from './RadialGradient';
import { interpolateNumber } from '../interpolate';
import { isString } from 'lodash-es';

export type GradientPoints = [[number, number], [number, number]];

const enum State {
  INIT,
  IN_GRADIENT_TYPE, // linear-gradient
  BEFORE_START_BRACKET, // linear-gradient
  AFTER_START_BRACKET, // linear-gradient ()
  IN_ANGLE_VALUE, // linear-gradient(18
  IN_ANGLE_UNIT, // linear-gradient(180deg
  BEFORE_ANGLE_SIDE, // linear-gradient(to
  IN_ANGLE_SIDE, // linear-gradient(to left
  AFTER_ANGLE_SIDE, // linear-gradient(to left
  BEFORE_ANGLE_CORNER, // linear-gradient(to left
  IN_ANGLE_CORNER, // linear-gradient(to top le
  AFTER_ANGLE_CORNER, // linear-gradient(to top left
  BEFORE_STOP_COLOR, // linear-gradient(to left,
  IN_STOP_COLOR, // linear-gradient(left, red
  IN_STOP_COLOR_RGB, // linear-gradient(left, red
  AFTER_STOP_COLOR, // linear-gradient180deg, red
  IN_STOP_OFFSET, // linear-gradient(left, red 1
  AFTER_STOP_OFFSET, // linear-gradient(left, red 10%
  AFTER_END_BRACKET, // linear-gradient(left, red 10%)
}

const enum EnumAngleType {
  DEFAULT,
  SIDE,
  CORNER,
  NUMBER,
}

type AngleUnit = 'deg' | 'rad' | 'grad' | 'turn';

const parseCache: Record<string, Gradient> = {};

function isWhiteSpace(c: string) {
  return /\s/.test(c);
}

export function isCssGradient(color: string) {
  return isString(color) && matchStr(color, 'linear-gradient') || matchStr(color, 'radial-gradient')
}

function matchStr(a: string, b: string) {
  for (let i = 0; i < b.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

// 关键字: (),空格

export function parseCssGradient(str: string): Gradient {
  if (parseCache[str]) {
    return parseCache[str];
  }
  let gradientTypeName: string = '';
  let temp: string = '';
  let angleType = EnumAngleType.DEFAULT as EnumAngleType;
  let angleValueString = '';
  let angleUnit: string = '';
  let side: string;
  let side2: string;
  let color: string = '';
  let offset: string = '';
  const colorStops: ColorStop[] = [];
  let currentState = State.INIT as State;

  function throwError() {
    throw new Error('not a valid gradient' + str);
  }

  function stateInit(char: string) {
    if (!isWhiteSpace(char)) {
      currentState = State.IN_GRADIENT_TYPE;
      gradientTypeName = char;
    }
  }
  function stateInGradientType(char: string) {
    if (!isWhiteSpace(char)) {
      if (char !== '(') {
        gradientTypeName += char;
      } else {
        currentState = State.AFTER_START_BRACKET;
      }
    } else {
      currentState = State.BEFORE_START_BRACKET;
    }
  }

  function stateBeforeBracket(char: string) {
    if (char === '(') {
      currentState === State.AFTER_START_BRACKET;
    } else if (!isWhiteSpace(char)) {
      throwError();
    }
  }

  function stateAfterBracket(char: string) {
    if (!isWhiteSpace(char)) {
      if (/[\d\.\-]/.test(char)) {
        currentState = State.IN_ANGLE_VALUE;
        angleType = EnumAngleType.NUMBER;
        currentState = State.IN_ANGLE_VALUE;
        angleValueString = char;
      } else if (char === ',') {
        color = temp;
        addColorWithOutOffset();
        currentState = State.BEFORE_STOP_COLOR;
      } else {
        temp += char;
      }
    } else {
      if (temp) {
        if (temp === 'to') {
          angleType = EnumAngleType.SIDE;
          currentState = State.BEFORE_ANGLE_SIDE;
        } else {
          currentState = State.AFTER_STOP_COLOR;
        }
      }
    }
  }

  function addColorWithOutOffset() {
    colorStops.push({
      color,
      offset: undefined,
    });
    color = '';
    offset = '';
  }

  function addColorStopWithOffset() {
    colorStops.push({
      color,
      offset: parseFloat(offset) / 100,
    });
    color = '';
    offset = '';
  }

  function stateInAngleValue(char: string) {
    if (/[\d\.]/.test(char)) {
      angleValueString += char;
    } else if (/[a-z]/.test(char)) {
      angleUnit += char;
    } else if (char === ',') {
      parseAngle();
      currentState = State.BEFORE_STOP_COLOR;
    }
  }

  function stateBeforeAngleSide(char: string) {
    if (!isWhiteSpace(char)) {
      currentState = State.IN_ANGLE_SIDE;
      side = char;
    }
  }

  function parseAngle() {
    currentState = State.BEFORE_STOP_COLOR;
  }

  function stateInAngleSide(char: string) {
    if (!isWhiteSpace(char)) {
      if (char === ',') {
        parseAngle();
      } else {
        side += char;
      }
    } else {
      currentState = State.AFTER_ANGLE_SIDE;
    }
  }

  function stateAfterAngleSide(char: string) {
    if (!isWhiteSpace(char)) {
      if (char === ',') {
        angleType = EnumAngleType.SIDE;
        parseAngle();
        currentState = State.BEFORE_STOP_COLOR;
      } else {
        angleType = EnumAngleType.CORNER;
        side2 = char;
        currentState = State.IN_ANGLE_CORNER;
      }
    }
  }

  function stateBeforeAngleCorner(char: string) {
    if (!isWhiteSpace(char)) {
      if (char === ',') {
        parseAngle();
      } else {
        angleType = EnumAngleType.CORNER;
        currentState = State.IN_ANGLE_CORNER;
        side2 = char;
      }
    }
  }

  function stateInAngleCorner(char: string) {
    if (!isWhiteSpace(char)) {
      if (char === ',') {
        parseAngle();
      } else {
        side2 += char;
      }
    } else {
      parseAngle();
      currentState = State.AFTER_ANGLE_CORNER;
    }
  }

  function stateAfterAngleCorner(char: string) {
    if (!isWhiteSpace(char)) {
      if (char !== ',') {
        throwError();
      } else {
        currentState = State.BEFORE_STOP_COLOR;
      }
    }
  }

  function stateBeforeStopColor(char: string) {
    if (!isWhiteSpace(char)) {
      currentState = State.IN_STOP_COLOR;
      color = char;
    }
  }

  function stateInStopColor(char: string) {
    if (!isWhiteSpace(char)) {
      if (char === ',' || char === ')') {
        addColorWithOutOffset();
        if (char === ',') {
          currentState = State.BEFORE_STOP_COLOR;
        }
        if (char === ')') {
          currentState = State.AFTER_END_BRACKET;
        }
      } else {
        color += char;
        if (char === '(') {
          currentState = State.IN_STOP_COLOR_RGB;
        }
      }
    } else {
      currentState = State.AFTER_STOP_COLOR;
    }
  }
  function stateInStopColorRGB(char: string) {
    color += char;
    if (char === ')') {
      currentState = State.AFTER_STOP_COLOR;
    }
  }

  function stateAfterStopColor(char: string) {
    if (!isWhiteSpace(char)) {
      if (char === ',' || char === ')') {
        addColorWithOutOffset();
        if (char === ',') {
          currentState = State.BEFORE_STOP_COLOR;
        } else if (char === ')') {
          currentState = State.AFTER_END_BRACKET;
        }
      } else {
        offset = char;
        currentState = State.IN_STOP_OFFSET;
      }
    }
  }

  function stateInStopOffset(char: string) {
    if (!isWhiteSpace(char)) {
      if (char === ',' || char === ')') {
        addColorStopWithOffset();
        if (char === ',') {
          currentState = State.BEFORE_STOP_COLOR;
        }
        if (char === ')') {
          currentState = State.AFTER_END_BRACKET;
        }
      } else {
        offset += char;
      }
    } else {
      addColorStopWithOffset();
      currentState = State.AFTER_STOP_OFFSET;
    }
  }

  function stateAfterStopOffset(char: string) {
    if (!isWhiteSpace(char)) {
      if (char === ',' || char === ')') {
        if (char === ',') {
          currentState = State.BEFORE_STOP_COLOR;
        } else if (char === ')') {
          currentState = State.AFTER_END_BRACKET;
        }
      } else {
        throwError();
      }
    }
  }

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    switch (currentState) {
      case State.INIT:
        stateInit(char);
        break;
      case State.IN_GRADIENT_TYPE:
        stateInGradientType(char);
        break;
      case State.BEFORE_START_BRACKET:
        stateBeforeBracket(char);
        break;

      case State.AFTER_START_BRACKET:
        stateAfterBracket(char);
        break;

      case State.IN_ANGLE_VALUE:
        stateInAngleValue(char);
        break;
      case State.BEFORE_ANGLE_CORNER:
        stateBeforeAngleCorner(char);
        break;
      case State.IN_ANGLE_CORNER:
        stateInAngleCorner(char);
        break;
      case State.AFTER_ANGLE_CORNER:
        stateAfterAngleCorner(char);
        break;
      case State.BEFORE_ANGLE_SIDE:
        stateBeforeAngleSide(char);
        break;
      case State.IN_ANGLE_SIDE:
        stateInAngleSide(char);
        break;
      case State.AFTER_ANGLE_SIDE:
        stateAfterAngleSide(char);
        break;
      case State.BEFORE_STOP_COLOR:
        stateBeforeStopColor(char);
        break;
      case State.IN_STOP_COLOR:
        stateInStopColor(char);
        break;
      case State.IN_STOP_COLOR_RGB:
        stateInStopColorRGB(char);
        break;
      case State.AFTER_STOP_COLOR:
        stateAfterStopColor(char);
        break;
      case State.IN_STOP_OFFSET:
        stateInStopOffset(char);
        break;
      case State.AFTER_STOP_OFFSET:
        stateAfterStopOffset(char);
        break;
    }
  }
  let gradientPoints: [[number, number], [number, number]];
  let angle: number;
  if (angleType === EnumAngleType.DEFAULT) {
    gradientPoints = [
      [0, 0],
      [0, 1],
    ];
  } else if (angleType === EnumAngleType.NUMBER) {
    const value = parseFloat(angleValueString);
    const radMap: Record<AngleUnit, number> = {
      deg: Math.PI / 180,
      rad: 1,
      grad: (Math.PI * 2) / 400,
      turn: Math.PI * 2,
    };
    angle = value * radMap[angleUnit as AngleUnit];
    gradientPoints = [[0, 0], [0, 0]];
  } else if (angleType === EnumAngleType.SIDE) {
    const sideMap = {
      top: [
        [0, 1],
        [0, 0],
      ],
      right: [
        [0, 0],
        [1, 0],
      ],
      bottom: [
        [0, 0],
        [0, 1],
      ],
      left: [
        [1, 0],
        [0, 0],
      ],
    };
    gradientPoints = sideMap[side as keyof typeof sideMap] as GradientPoints;
  } else if (angleType === EnumAngleType.CORNER) {
    const cornerMap = {
      topLeft: [
        [1, 1],
        [0, 0],
      ],
      topRight: [
        [0, 1],
        [1, 0],
      ],
      bottomLeft: [
        [1, 0],
        [0, 1],
      ],
      bottomRight: [
        [0, 0],
        [1, 1],
      ],
    };
    let cornerSide: keyof typeof cornerMap;
    const sides = [side, side2];
    if (sides.some(s => s === 'top') && sides.some(s => s === 'left')) {
      cornerSide = 'topLeft';
    }
    if (sides.some(s => s === 'top') && sides.some(s => s === 'right')) {
      cornerSide = 'topRight';
    }
    if (sides.some(s => s === 'bottom') && sides.some(s => s === 'left')) {
      cornerSide = 'bottomLeft';
    }
    if (sides.some(s => s === 'bottom') && sides.some(s => s === 'right')) {
      cornerSide = 'bottomRight';
    }
    gradientPoints = cornerMap[cornerSide] as GradientPoints;
  }
  let begin: number = undefined;
  let end: number = undefined;
  const unsetOffsets: ColorStop[] = [];
  for (let i = 0; i < colorStops.length; i++) {
    const { offset } = colorStops[i];
    if (offset === undefined) {
      unsetOffsets.push(colorStops[i]);
    } else {
      if (!unsetOffsets.length) {
        begin = offset;
      } else {
        end = offset;
        setUnsetOffsets(unsetOffsets, begin, end);
        unsetOffsets.length = 0;
        begin = offset;
        end = undefined;
      }
    }
    if (unsetOffsets.length && i === colorStops.length - 1) {
      setUnsetOffsets(unsetOffsets, begin, end);
    }
  }

  function setUnsetOffsets(unsetStops: ColorStop[], start: number, end: number) {
    if (start === undefined) {
      unsetStops[0].offset = 0;
      start = 0;
    }

    if (end === undefined) {
      unsetStops[unsetStops.length - 1].offset = 1;
      end = 1;
    }

    unsetStops = unsetStops.filter(item => item.offset === undefined);

    unsetStops.forEach((item, index) => {
      item.offset = interpolateNumber(start, end, (index + 1) / (unsetStops.length + 1));
    });
  }
  
  let res: Gradient;
  if (gradientTypeName === 'linear-gradient') {
    res= new LinearGradient({
      angle: angleType === EnumAngleType.NUMBER ? angle : undefined,
      x1: gradientPoints[0][0],
      y1: gradientPoints[0][1],
      x2: gradientPoints[1][0],
      y2: gradientPoints[1][1],
      stops: colorStops,
    });
  } else {
    res = new RadialGradient({
      cx: 0.5,
      cy: 0.5,
      r: 1,
      stops: colorStops,
    })
  }
  parseCache[str] = res;
  return res;
}
