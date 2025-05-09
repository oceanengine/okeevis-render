
import { segmentIntersection } from '../intersection/segment-intersection';
import { clipSegment, getPointAtSegment, Segment } from '../pathSegment';

export function segmentJoin(seg1: Segment, seg2: Segment, lineJoin: 'miter' | 'round' | 'bevel', lineWidth: number,  miterLimit: number = 10): Segment[] {
  if (seg1 === seg2) {
    return [];
  }
  if (!seg1 || !seg2) {
    return [];
  }
  const intersections = segmentIntersection(seg1, seg2);
  if (!intersections.length) {
    // https://developer.mozilla.org/zh-CN/docs/Web/SVG/Reference/Attribute/stroke-linejoin
    const p1 = getPointAtSegment(1, seg1);
    const p2 = getPointAtSegment(0, seg2);
    if (lineJoin === 'miter') {
      // connect two point with line
      if (p1.alpha === p2.alpha) {
        return [{
          type: 'line',
          params: [p1.x, p1.y, p2.x, p2.y],
        }];
      }
      const alpha = (Math.PI - Math.abs(p1.alpha - p2.alpha)) / 2;
      const currentMiterLimit = Math.abs(1 / Math.sin(alpha));
      if (currentMiterLimit <= miterLimit) {
        const growLength = Math.abs(lineWidth / 2 / Math.tan(alpha))
        const joinX = p1.x + Math.cos(p1.alpha) * growLength;
        const joinY = p1.y + Math.sin(p1.alpha) * growLength;
        return [
          {
            type: 'line',
            params: [p1.x, p1.y, joinX, joinY],
          },
          {
            type: 'line',
            params: [joinX, joinY, p2.x, p2.y],
          },
        ]
      } else {
        // bevel
        return [
          {
            type: 'line',
            params: [p1.x, p1.y, p2.x, p2.y],
          }
        ]
      }
      
    } else if (lineJoin === 'bevel') {
      return [
        {
          type: 'line',
          params: [p1.x, p1.y, p2.x, p2.y],
        }
      ]
    } else if (lineJoin === 'round') {
      const midx = (p1.x + p2.x) / 2;
      const midy = (p1.y + p2.y) / 2;
      const midAngle = (p1.alpha + p2.alpha - Math.PI) / 2 + Math.PI;
      const r = lineWidth / 2;
      const distance = r * Math.cos(Math.abs(p1.alpha - p2.alpha) / 2);
      const cx = midx + distance * Math.cos(midAngle);
      const cy = midy + distance * Math.sin(midAngle);
      const startAngle = Math.atan2(p1.y - cy, p1.x - cx);
      const endAngle = Math.atan2(p2.y - cy, p2.x - cx);
      return [
        {
          type: 'arc',
          params: [cx, cy, r, startAngle, endAngle]
        }
      ]
    }
  } else {
    const {t1, t2 } = intersections[0];
    const clip1 = clipSegment(seg1, 0, t1);
    const clip2 = clipSegment(seg2, t2, 1);
    seg1.params = clip1.params;
    seg2.params = clip2.params;
    return [
    ]
  }
}