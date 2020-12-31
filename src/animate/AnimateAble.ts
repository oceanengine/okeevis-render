import {
  EasingName
} from './ease'

export interface AnimateConf {
  during ? : number;
  ease ? : Function;
  delay ? : number;
  onFrame ? : Function;
  callback ? : Function;
}

export interface AnimateOption {
  statTime ? : number;
  stopped: boolean;
  from: any;
  to: any;
  during ? : number;
  ease ? : Function | EasingName;
  delay ? : number;
  onFrame ? : Function;
  callback ? : Function;
}



export default abstract class AnimateAble < T > {

  public abstract addAnimation(option: AnimateOption): void;

  public abstract animateTo(target: T, during: number, ease: EasingName, callback: Function, delay: number): void;

  public abstract stopAllAnimation(): this;

  public abstract onFrame(now: number): void;

}