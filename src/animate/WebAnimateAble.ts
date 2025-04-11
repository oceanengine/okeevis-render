import { Keyframe, KeyframeEffectOptions   } from "./interface";
import { Animation } from './Animation';

interface GetAnimationsOptions {
    subtree?: boolean;
}

export type { Keyframe, KeyframeEffectOptions };
export interface WebAnimatable {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animate) */
    animate(keyframes: Keyframe[] | Keyframe | null, options?: number | KeyframeEffectOptions): Animation;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getAnimations) */
    getAnimations(options?: GetAnimationsOptions): Animation[];
}