
/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation) */
export interface Animation extends EventTarget {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/currentTime) */
    currentTime: number | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/effect) */
    effect: AnimationEffect | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/finished) */
    readonly finished: Promise<Animation>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/id) */
    id: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/cancel_event) */
    oncancel: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/finish_event) */
    onfinish: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/remove_event) */
    onremove: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/pending) */
    readonly pending: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/playState) */
    readonly playState: AnimationPlayState;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/playbackRate) */
    playbackRate: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/ready) */
    readonly ready: Promise<Animation>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/replaceState) */
    readonly replaceState: "active" | "persisted" | "removed";
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/startTime) */
    startTime:  number | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/timeline) */
    timeline: AnimationTimeline | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/cancel) */
    cancel(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/commitStyles) */
    commitStyles(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/finish) */
    finish(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/pause) */
    pause(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/persist) */
    persist(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/play) */
    play(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/reverse) */
    reverse(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Animation/updatePlaybackRate) */
    updatePlaybackRate(playbackRate: number): void;
    addEventListener<K extends keyof AnimationEventMap>(type: K, listener: (this: Animation, ev: AnimationEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof AnimationEventMap>(type: K, listener: (this: Animation, ev: AnimationEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}