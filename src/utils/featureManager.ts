import type { getScheduler } from '../multi-thread/scheduler';

export interface Features {
  worker?: typeof getScheduler;
}
const featues: Features = {};
export function registerFeature<T extends keyof Features>(name: T, feature: Features[T]) {
  featues[name] = feature;
}

export function getFeature<T extends keyof Features>(name: T): Features[T] {
  return featues[name];
}
