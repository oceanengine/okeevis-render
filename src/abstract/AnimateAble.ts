import { EasingName } from '../animate/ease';

export interface AnimateConf {
  during?: number;
  ease?: EasingName;
  delay?: number;
  onFrame?: Function;
  callback?: Function;
}

export interface AnimateOption<T> {
  startTime?: number;
  stopped: boolean;
  from: T;
  to: T;
  during: number;
  ease: Function | EasingName;
  delay: number;
  onFrame?: Function;
  callback?: Function;
}

export default abstract class AnimateAble<T> {
  public abstract animateTo(
    target: T,
    during: number,
    ease: EasingName,
    callback: Function,
    delay: number,
  ): void;

  public abstract stopAllAnimation(): this;

  public abstract onFrame(now: number): void;
}
