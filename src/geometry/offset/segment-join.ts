
import { segmentIntersection } from '../intersection/segment-intersection';
import { clipSegment, getPointAtSegment, Segment } from '../pathSegment';

export function segmentJoin(seg1: Segment, seg2: Segment, originX: number, originY: number, lineJoin: 'miter' | 'round' | 'bevel', lineWidth: number,  miterLimit: number): Segment[] {
  const intersections = segmentIntersection(seg1, seg2);
  if (!intersections.length) {
    // https://developer.mozilla.org/zh-CN/docs/Web/SVG/Reference/Attribute/stroke-linejoin
    const p1 = getPointAtSegment(1, seg1);
    const p2 = getPointAtSegment(0, seg2);
    if (lineJoin === 'miter') {
      // connect two point with line
      if (p1.alpha === p2.alpha) {
        return [seg1, seg2];
      }
      const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
      // todo
      const joinX = 0;
      const joinY = 0;
      const joinDistance = Math.sqrt((joinX - originX) ** 2 + (joinY - originY) ** 2);
      if (joinDistance / lineWidth <= miterLimit) {
        return [
          seg1,
          {
            type: 'line',
            params: [p1.x, p1.y, joinX, joinY],
          },
          {
            type: 'line',
            params: [joinX, joinY, p2.x, p2.y],
          },
          seg2
        ]
      } else {
        // todo
      }
      
    } else if (lineJoin === 'bevel') {
      const connectSegment: Segment = {
        type: 'line',
        params: [p1.x, p1.y, p2.x, p2.y],
      };
      return [
        seg1,
        connectSegment,
        seg2
      ]
    } else if (lineJoin === 'round') {
      const cx = (p1.x + p2.x) / 2;
      const cy = (p1.y + p2.y) / 2;
      const r = lineWidth / 2;
      const startAngle = Math.atan2(p1.y - cy, p1.x - cx);
      const endAngle = Math.atan2(p2.y - cy, p2.x - cx);
      const connectSegment: Segment = {
        type: 'arc',
        params: [cx, cy, r, startAngle, endAngle]
      };
      return [
        seg1,
        connectSegment,
        seg2
      ]
    }
  } else {
    const {t1, t2 } = intersections[0];
    return [
      clipSegment(seg1, 0, t1),
      clipSegment(seg2, t2, 1),
    ]
  }
}