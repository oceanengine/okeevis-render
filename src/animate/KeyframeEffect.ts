import { off } from "hammerjs";
import Element, { ElementAttr } from "../shapes/Element";


export interface Keyframe extends ElementAttr  {
    offset?: number;
    easing?: string;
}

interface PropertyIndexedKeyframes {
    composite?: CompositeOperationOrAuto | CompositeOperationOrAuto[];
    easing?: string | string[];
    offset?: number | (number | null)[];
    [property: string]: string | string[] | number | null | (number | null)[] | undefined;
}

interface EffectTiming {
    delay?: number;
    direction?: PlaybackDirection;
    duration?: number;
    easing?: string;
    endDelay?: number;
    fill?: FillMode;
    iterationStart?: number;
    iterations?: number;
    playbackRate?: number;
}

export interface KeyframeEffectOptions extends EffectTiming {
    composite?: CompositeOperation;
    iterationComposite?: IterationCompositeOperation;
}

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationEffect) */
interface AnimationEffect {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationEffect/getComputedTiming) */
    getComputedTiming(): ComputedEffectTiming;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationEffect/getTiming) */
    getTiming(): EffectTiming;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AnimationEffect/updateTiming) */
    updateTiming(timing?: OptionalEffectTiming): void;
}


interface KeyframeEffect extends AnimationEffect {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/KeyframeEffect/composite) */
    composite: CompositeOperation;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/KeyframeEffect/iterationComposite) */
    iterationComposite: IterationCompositeOperation;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/KeyframeEffect/pseudoElement) */
    pseudoElement: string | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/KeyframeEffect/target) */
    target: Element | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/KeyframeEffect/getKeyframes) */
    getKeyframes(): ComputedKeyframe[];
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/KeyframeEffect/setKeyframes) */
    setKeyframes(keyframes: Keyframe[] | PropertyIndexedKeyframes | null): void;
}