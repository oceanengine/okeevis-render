

export interface Transition {
  values: [any, any];
  startTime: number;
  finished: boolean;
  transitionDuration?: number;
  transitionTimingFunction?: string;
  transitionProperty?: string;
  transitionDelay?: number;
}