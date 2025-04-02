

export interface Transition {
  values: [any, any];
  startTime: number;
  started:boolean;
  finished: boolean;
  transitionDuration?: number;
  transitionTimingFunction?: string;
  transitionProperty?: string;
  transitionDelay?: number;
}