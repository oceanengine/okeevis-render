import { InterpolateFunction } from './index';

const interpolateNumber: InterpolateFunction<number> = (
  from: number,
  to: number,
  k: number,
): number => {
  if (isNaN(from)) {
    return to;
  }
  return from + (to - from) * k;
};

export default interpolateNumber;
