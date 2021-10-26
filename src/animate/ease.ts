/* eslint-disable */
export type EasingName = keyof typeof easing;
export type EasingFunction = (k: number) => number;
const easing = {
  Linear: (k: number): number => {
    return k;
  },
  QuadraticIn: (k: number): number => {
    return k * k;
  },
  QuadraticOut: (k: number): number => {
    return k * (2 - k);
  },
  QuadraticInOut: (k: number): number => {
    if ((k *= 2) < 1) {
      return 0.5 * k * k;
    }
    return -0.5 * (--k * (k - 2) - 1);
  },
  CubicIn: (k: number): number => {
    return k * k * k;
  },
  CubicOut: (k: number): number => {
    return --k * k * k + 1;
  },
  CubicInOut: (k: number): number => {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k;
    }
    return 0.5 * ((k -= 2) * k * k + 2);
  },
  QuarticIn: (k: number): number => {
    return k * k * k * k;
  },
  QuarticOut: (k: number): number => {
    return 1 - --k * k * k * k;
  },
  QuarticInOut: (k: number): number => {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k * k;
    }
    return -0.5 * ((k -= 2) * k * k * k - 2);
  },
  QuinticIn: (k: number): number => {
    return k * k * k * k * k;
  },
  QuinticOut: (k: number): number => {
    return --k * k * k * k * k + 1;
  },
  /**
   * @param {number} k
   * @return {number}
   */
  QuinticInOut: (k: number): number => {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k * k * k;
    }
    return 0.5 * ((k -= 2) * k * k * k * k + 2);
  },
  SinusoidalIn: (k: number): number => {
    return 1 - Math.cos((k * Math.PI) / 2);
  },
  SinusoidalOut: (k: number): number => {
    return Math.sin((k * Math.PI) / 2);
  },
  SinusoidalInOut: (k: number): number => {
    return 0.5 * (1 - Math.cos(Math.PI * k));
  },
  ExponentialIn: (k: number): number => {
    return k === 0 ? 0 : Math.pow(1024, k - 1);
  },
  ExponentialOut: (k: number): number => {
    return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
  },
  ExponentialInOut: (k: number): number => {
    if (k === 0) {
      return 0;
    }
    if (k === 1) {
      return 1;
    }
    if ((k *= 2) < 1) {
      return 0.5 * Math.pow(1024, k - 1);
    }
    return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
  },
  CircularIn: (k: number): number => {
    return 1 - Math.sqrt(1 - k * k);
  },
  CircularOut: (k: number): number => {
    return Math.sqrt(1 - --k * k);
  },
  CircularInOut: (k: number): number => {
    if ((k *= 2) < 1) {
      return -0.5 * (Math.sqrt(1 - k * k) - 1);
    }
    return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
  },
  ElasticIn: (k: number): number => {
    let s;
    let a = 0.1;
    const p = 0.4;
    if (k === 0) {
      return 0;
    }
    if (k === 1) {
      return 1;
    }
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI);
    }
    return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin(((k - s) * (2 * Math.PI)) / p));
  },
  ElasticOut: (k: number): number => {
    let s;
    let a = 0.1;
    const p = 0.4;
    if (k === 0) {
      return 0;
    }
    if (k === 1) {
      return 1;
    }
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI);
    }
    return a * Math.pow(2, -10 * k) * Math.sin(((k - s) * (2 * Math.PI)) / p) + 1;
  },
  ElasticInOut: (k: number): number => {
    let s;
    let a = 0.1;
    const p = 0.4;
    if (k === 0) {
      return 0;
    }
    if (k === 1) {
      return 1;
    }
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI);
    }
    if ((k *= 2) < 1) {
      return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin(((k - s) * (2 * Math.PI)) / p));
    }
    return a * Math.pow(2, -10 * (k -= 1)) * Math.sin(((k - s) * (2 * Math.PI)) / p) * 0.5 + 1;
  },
  BackIn: (k: number): number => {
    const s = 1.70158;
    return k * k * ((s + 1) * k - s);
  },
  BackOut: (k: number): number => {
    const s = 1.70158;
    return --k * k * ((s + 1) * k + s) + 1;
  },
  BackInOut: (k: number): number => {
    const s = 1.70158 * 1.525;
    if ((k *= 2) < 1) {
      return 0.5 * (k * k * ((s + 1) * k - s));
    }
    return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
  },
  BounceIn: (k: number): number => {
    return 1 - easing.BounceOut(1 - k);
  },
  BounceOut: (k: number): number => {
    if (k < 1 / 2.75) {
      return 7.5625 * k * k;
    } if (k < 2 / 2.75) {
      return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
    } if (k < 2.5 / 2.75) {
      return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
    } 
      return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
    
  },
  BounceInOut: (k: number): number => {
    if (k < 0.5) {
      return easing.BounceIn(k * 2) * 0.5;
    }
    return easing.BounceOut(k * 2 - 1) * 0.5 + 0.5;
  },
};

export default easing;
