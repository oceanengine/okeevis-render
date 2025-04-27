
import { Segment } from '../pathSegment';

export function segmentJoin(seg1: Segment, seg2: Segment, lineJoin: 'miter' | 'round' | 'bevel', miterLimit: number): Segment[] {
  const { type: type1, params: params1 } = seg1;
  const { type: type2, params: params2 } = seg2;
  
  return [];
}