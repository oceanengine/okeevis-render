import { findIndex, findLastIndex, last } from 'lodash-es';
import Element from '../shapes/Element';
import { SyntheticAnimationEvent } from '../event';
import { parseEase } from './ease';
import { AnimationTimeline, KeyframeEffectOptions } from './interface';
import { processOffsetList } from '../utils/offset-list';
import { interpolate } from '../interpolate';
import interpolatePath from '../interpolate/interpolatePath';
import interpolateColor from '../interpolate/interpolateColor';
import EventFul from '../utils/Eventful';
export class Animation extends EventFul {
  public currentTime: number | null;
  public id: string;
  public pending: boolean;
  public playState: AnimationPlayState = 'idle';
  public ready: Promise<Animation>;
  public replaceState: 'active' | 'persisted' | 'removed';
  public startTime: number | null;
  public timeline: AnimationTimeline | null;
  public ontick: (e: number) => void | null;
  public oncancel: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/finish_event) */
  public onfinish: (() => void) | null;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/remove_event) */
  public onremove: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null;
  private _finished: Promise<Animation>;
  private _persisted: boolean;
  private _keyframes: Keyframe[];
  private _target: Element;
  private _progress: number = 0;
  private _elapsedTime: number = 0;
  private _curDirection: 'forward' | 'backward';
  private _interpolateAttr: any = {};
  private _iterationCount: number = 1;
  private _options: KeyframeEffectOptions;
  private _resolver: () => void;
  private _updateAnimationAttr: () => void;
  constructor(keyframes: Keyframe[], options: number | KeyframeEffectOptions) {
    super();
    processOffsetList(keyframes);
    this._keyframes = keyframes;
    if (typeof options === 'number') {
      this._options = {
        duration: options,
      };
    } else {
      this._options = options;
    }
    this._finished = new Promise(resolve => {
      this._resolver = () => resolve(this);
    });
  }

  public setTarget(target: Element<any>, updateAnimationAttr: () => void) {
    this._target = target;
    this._updateAnimationAttr = updateAnimationAttr;
    if (target.isConnected) {
      this.timeline = target.ownerRender.timeline;
      if (!this.currentTime) {
        this.currentTime = this.timeline.currentTime;
      }
    }
  }

  public get finished(): Promise<Animation> {
    return this._finished;
  }

  public get isPersisted(): boolean {
    return this._persisted;
  }

  public get direction(): 'forward' | 'backward' {
    return this._curDirection;
  }

  public cancel() {
    this.playState = 'idle';
    this._elapsedTime = 0;
    this._iterationCount = 1;
    this._interpolateAttr = {};
    this._updateAnimationAttr();
  }

  public commitStyles() {
    this._target.setAttr(this._interpolateAttr);
  }

  public getStyles() {
    return this._interpolateAttr;
  }

  public finish() {
    if (this.playState === 'finished') {
      return;
    }
    const { fill = 'none', iterations = 1 } = this._options;
    if (!Number.isFinite(iterations)) {
      throw new Error('Cannot call "finish" on an infinite animation');
    }

    this._resolver();
    setTimeout(() => {
      this._target.dispatchEvent(
        new SyntheticAnimationEvent('animationend', {
          elapsedTime: this._elapsedTime,
          bubbles: true,

        }),
      );
    }, this._options.endDelay || 0);

    this.playState = 'finished';
    if (fill === 'none') {
      this._interpolateAttr = {};
    }
    if (this.direction === 'forward' && (fill === 'both' || fill === 'forwards')) {
      this._interpolateAttr = last(this._keyframes);
    }
    if (this.direction === 'backward' && (fill === 'both' || fill === 'backwards')) {
      this._interpolateAttr = this._keyframes[0];
    }
    this._updateAnimationAttr();
    this.onfinish && this.onfinish();
  }

  public pause() {
    this.playState = 'paused';
  }

  public persist() {
    this._persisted = true;
  }

  public play() {
    this.playState = 'running';
  }

  public reverse() {
    if (!this._options.playbackRate) {
      this._options.playbackRate = 1;
    }
    this._options.playbackRate *= -1;
  }

  public updatePlaybackRate(playbackRate: number) {
    this._options.playbackRate = playbackRate;
  }

  public tick(updater: (key: string, value: any) => void) {
    const {
      duration = 0,
      easing = 'linear',
      delay: startDelay = 0,
      direction = 'normal',
      iterations = 1,
      iterationStart = 0,
      playbackRate = 1,
      fill = 'none',
    } = this._options;

    const { _keyframes, playState, timeline } = this;

    let curDirection: 'forward' | 'backward' = 'forward';

    if (direction === 'normal') {
      curDirection = 'forward';
    } else if (direction === 'alternate') {
      curDirection = this._iterationCount % 2 === 1 ? 'forward' : 'backward';
    } else if (direction === 'alternate-reverse') {
      curDirection = this._iterationCount % 2 === 1 ? 'backward' : 'forward';
    } else if (direction === 'reverse') {
      curDirection = 'backward';
    }

    if (playState !== 'running') {
      return;
    }

    if (!this.currentTime) {
      if (fill === 'both' || fill === 'forwards') {
        this._interpolateAttr =  {...curDirection === 'forward' ? this._keyframes[0] : last(this._keyframes)};
      }
      this._updateAnimationAttr();
    }
    const delay = this._iterationCount === 1 ? startDelay : 0;
    const prevTime = this.currentTime || timeline.currentTime;
    this.currentTime = timeline.currentTime;
    const timePassed = this.currentTime - prevTime;
    this._elapsedTime += timePassed * playbackRate;
    if (this._elapsedTime < delay) {
      return;
    }
    const progress = Math.min((this._elapsedTime - delay) / duration, 1);
    this._progress = progress;
    this._curDirection = curDirection;
    let targetFrameIndex = findLastIndex(_keyframes, fr => fr.offset >= progress);
    let fromFrameIndex = targetFrameIndex - 1;
    if (curDirection === 'backward') {
      targetFrameIndex = findIndex(_keyframes, fr => fr.offset <= 1 - progress);
      fromFrameIndex = targetFrameIndex + 1;
    }
    const fromKeyFrame = _keyframes[fromFrameIndex];
    const targetKeyFrame = _keyframes[targetFrameIndex];
    const startOffset = fromKeyFrame.offset;
    const endOffset = targetKeyFrame.offset;
    let subProgress = (progress - startOffset) / (endOffset - startOffset);
    if (curDirection === 'backward') {
      subProgress = 1 - subProgress;
    }
    const curEasing = parseEase(fromKeyFrame.easing ?? easing);
    const k = curEasing(subProgress);
    let fn: Function = interpolate;

    for (const key in targetKeyFrame) {
      if (key === 'offset' || key === 'composite' || key === 'easing') {
        continue;
      }
      if (key === 'color' || key === 'fill' || key === 'stroke' || key === 'shadowColor') {
        fn = interpolateColor;
      } else if (key === 'pathData') {
        fn = interpolatePath;
      } else {
        fn = interpolate;
      }
      const value = fn(fromKeyFrame[key], targetKeyFrame[key], k);
      this._interpolateAttr[key] = value;
      updater(key, value);
    }


    if (this.ontick) {
      this.ontick(progress);
    }

    if (progress === 0 && this._iterationCount === 1) {
      this.startTime = timeline.currentTime;
      this._target.dispatchEvent(
        new SyntheticAnimationEvent('animationstart', {
          elapsedTime: this._elapsedTime,
          bubbles: true,
        }),
      );
    }
    if (progress === 1) {
      if (this._iterationCount < iterations) {
        this._iterationCount++;
        this._elapsedTime = 0;
        this._progress = 0;
        this._target.dispatchEvent(
          new SyntheticAnimationEvent('animationiteration', {
            elapsedTime: this._elapsedTime,
            bubbles: true,
          }),
        );
      } else {
        this.finish();
      }
    }
  }
}
