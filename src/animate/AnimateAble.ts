import { Keyframe, KeyframeEffectOptions   } from "./KeyframeEffect";
import { Animation } from './Animation';

interface GetAnimationsOptions {
    subtree?: boolean;
}
export interface Animatable {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animate) */
    animate(keyframes: Keyframe[] | Keyframe | null, options?: number | KeyframeEffectOptions): Animation;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getAnimations) */
    getAnimations(options?: GetAnimationsOptions): Animation[];
}