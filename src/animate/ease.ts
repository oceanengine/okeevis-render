
export type EasingName = keyof (typeof all);
export type EasingFunction = (k: number) => number;
const easing = {
  // 线性
  /**
   * @param {number} k
   * @return {number}
   */
  Linear: (k: number): number => {
      return k;
  },

  // 二次方的缓动（t^2）
  /**
   * @param {number} k
   * @return {number}
   */
  QuadraticIn: (k: number): number => {
      return k * k;
  },
  /**
   * @param {number} k
   * @return {number}
   */
  QuadraticOut: (k: number): number => {
      return k * (2 - k);
  },
  /**
   * @param {number} k
   * @return {number}
   */
  QuadraticInOut: (k: number): number => {
      if ((k *= 2) < 1) {
          return 0.5 * k * k;
      }
      return -0.5 * (--k * (k - 2) - 1);
  },

  // 三次方的缓动（t^3）
  /**
   * @param {number} k
   * @return {number}
   */
  CubicIn: (k: number): number => {
      return k * k * k;
  },
  /**
   * @param {number} k
   * @return {number}
   */
  CubicOut: (k: number): number => {
      return --k * k * k + 1;
  },
  /**
   * @param {number} k
   * @return {number}
   */
  CubicInOut: (k: number): number => {
      if ((k *= 2) < 1) {
          return 0.5 * k * k * k;
      }
      return 0.5 * ((k -= 2) * k * k + 2);
  },

  // 四次方的缓动（t^4）
  /**
   * @param {number} k
   * @return {number}
   */
  QuarticIn: (k: number): number => {
      return k * k * k * k;
  },
  /**
   * @param {number} k
   * @return {number}
   */
  QuarticOut: (k: number): number => {
      return 1 - --k * k * k * k;
  },
  /**
   * @param {number} k
   * @return {number}
   */
  QuarticInOut: (k: number): number => {
      if ((k *= 2) < 1) {
          return 0.5 * k * k * k * k;
      }
      return -0.5 * ((k -= 2) * k * k * k - 2);
  },

  // 五次方的缓动（t^5）
  /**
   * @param {number} k
   * @return {number}
   */
  QuinticIn: (k: number): number => {
      return k * k * k * k * k;
  },
  /**
   * @param {number} k
   * @return {number}
   */
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

  // 正弦曲线的缓动（sin(t)）
  /**
   * @param {number} k
   * @return {number}
   */
  SinusoidalIn: (k: number): number => {
      return 1 - Math.cos((k * Math.PI) / 2);
  },
  /**
   * @param {number} k
   * @return {number}
   */
  SinusoidalOut: (k: number): number => {
      return Math.sin((k * Math.PI) / 2);
  },
  /**
   * @param {number} k
   * @return {number}
   */
  SinusoidalInOut: (k: number): number => {
      return 0.5 * (1 - Math.cos(Math.PI * k));
  },

  // 指数曲线的缓动（2^t）
  /**
   * @param {number} k
   * @return {number}
   */
  ExponentialIn: (k: number): number => {
      return k === 0 ? 0 : Math.pow(1024, k - 1);
  },
  /**
   * @param {number} k
   * @return {number}
   */
  ExponentialOut: (k: number): number => {
      return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
  },
  /**
   * @param {number} k
   * @return {number}
   */
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

  // 圆形曲线的缓动（sqrt(1-t^2)）
  /**
   * @param {number} k
   * @return {number}
   */
  CircularIn: (k: number): number => {
      return 1 - Math.sqrt(1 - k * k);
  },
  /**
   * @param {number} k
   * @return {number}
   */
  CircularOut: (k: number): number => {
      return Math.sqrt(1 - --k * k);
  },
  /**
   * @param {number} k
   * @return {number}
   */
  CircularInOut: (k: number): number => {
      if ((k *= 2) < 1) {
          return -0.5 * (Math.sqrt(1 - k * k) - 1);
      }
      return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
  },

  // 创建类似于弹簧在停止前来回振荡的动画
  /**
   * @param {number} k
   * @return {number}
   */
  ElasticIn: (k: number): number => {
      var s;
      var a = 0.1;
      var p = 0.4;
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
      return -(
          a *
          Math.pow(2, 10 * (k -= 1)) *
          Math.sin(((k - s) * (2 * Math.PI)) / p)
      );
  },
  /**
   * @param {number} k
   * @return {number}
   */
  ElasticOut: (k: number): number => {
      var s;
      var a = 0.1;
      var p = 0.4;
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
      return (
          a * Math.pow(2, -10 * k) * Math.sin(((k - s) * (2 * Math.PI)) / p) +
          1
      );
  },
  /**
   * @param {number} k
   * @return {number}
   */
  ElasticInOut: (k: number): number => {
      var s;
      var a = 0.1;
      var p = 0.4;
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
          return (
              -0.5 *
              (a *
                  Math.pow(2, 10 * (k -= 1)) *
                  Math.sin(((k - s) * (2 * Math.PI)) / p))
          );
      }
      return (
          a *
              Math.pow(2, -10 * (k -= 1)) *
              Math.sin(((k - s) * (2 * Math.PI)) / p) *
              0.5 +
          1
      );
  },

  // 在某一动画开始沿指示的路径进行动画处理前稍稍收回该动画的移动
  /**
   * @param {number} k
   * @return {number}
   */
  BackIn: (k: number): number => {
      var s = 1.70158;
      return k * k * ((s + 1) * k - s);
  },
  /**
   * @param {number} k
   * @return {number}
   */
  BackOut: (k: number): number => {
      var s = 1.70158;
      return --k * k * ((s + 1) * k + s) + 1;
  },
  /**
   * @param {number} k
   * @return {number}
   */
  BackInOut: (k: number): number => {
      var s = 1.70158 * 1.525;
      if ((k *= 2) < 1) {
          return 0.5 * (k * k * ((s + 1) * k - s));
      }
      return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
  },

  // 创建弹跳效果
  /**
   * @param {number} k
   * @return {number}
   */
  BounceIn: (k: number): number => {
      return 1 - easing.BounceOut(1 - k);
  },
  /**
   * @param {number} k
   * @return {number}
   */
  BounceOut: (k: number): number => {
      if (k < 1 / 2.75) {
          return 7.5625 * k * k;
      } else if (k < 2 / 2.75) {
          return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
      } else if (k < 2.5 / 2.75) {
          return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
      } else {
          return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
      }
  },
  /**
   * @param {number} k
   * @return {number}
   */
  BounceInOut: (k: number): number => {
      if (k < 0.5) {
          return easing.BounceIn(k * 2) * 0.5;
      }
      return easing.BounceOut(k * 2 - 1) * 0.5 + 0.5;
  },
};

const all = {
  ...easing,
  // no easing, no acceleration
  linear: (t: number): number => {
      return t;
  },
  // accelerating from zero velocity
  easeInQuad: (t: number): number => {
      return t * t;
  },
  // decelerating to zero velocity
  easeOutQuad: (t: number): number => {
      return t * (2 - t);
  },
  // acceleration until halfway, then deceleration
  easeInOutQuad: (t: number): number => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  // accelerating from zero velocity
  easeInCubic: (t: number): number => {
      return t * t * t;
  },
  // decelerating to zero velocity
  easeOutCubic: (t: number): number => {
      return --t * t * t + 1;
  },
  // acceleration until halfway, then deceleration
  easeInOutCubic: (t: number): number => {
      return t < 0.5
          ? 4 * t * t * t
          : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  // accelerating from zero velocity
  easeInQuart: (t: number): number => {
      return t * t * t * t;
  },
  // decelerating to zero velocity
  easeOutQuart: (t: number): number => {
      return 1 - --t * t * t * t;
  },
  // acceleration until halfway, then deceleration
  easeInOutQuart: (t: number): number => {
      return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
  },
  // accelerating from zero velocity
  easeInQuint: (t: number): number => {
      return t * t * t * t * t;
  },
  // decelerating to zero velocity
  easeOutQuint: (t: number): number => {
      return 1 + --t * t * t * t * t;
  },
  // acceleration until halfway, then deceleration
  easeInOutQuint: (t: number): number => {
      return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
  },
};

export default all;