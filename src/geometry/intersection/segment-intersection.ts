import { PathIntersection } from '../Path2D';
import { Segment } from '../pathSegment';
import { segmentToCurve } from '../toCurve';
import { bezierIntersection } from './bezier-intersection';
import { bezierLineIntersection } from './bezier-line-intersection';
import { lineLineIntersection } from './line-line-intersection';

export function segmentIntersection(segment1: Segment, segment2: Segment, res: PathIntersection[] = []): PathIntersection[] {
  const { type: type1, params: params1 } = segment1;
  const { type: type2, params: params2 } = segment2;
  if (type1 === 'line' && type2 === 'line') {
    const [x1, y1, x2, y2] = params1;
    const [x3, y3, x4, y4] = params2;
    const point = lineLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4);
    if (point) {
      res.push(point);
    }
  } else if (type1 === 'line' && type2 === 'bezier') {
    const [x1, y1, x2, y2] = params1;
    const [p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y] = params2;
    const points = bezierLineIntersection(
      p1x,
      p1y,
      p2x,
      p2y,
      p3x,
      p3y,
      p4x,
      p4y,
      x1,
      y1,
      x2,
      y2,
      res,
    );
  } else if (type1 === 'bezier' && type2 === 'line') {
    const [x1, y1, x2, y2] = params2;
    const [p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y] = params1;
    bezierLineIntersection(
      p1x,
      p1y,
      p2x,
      p2y,
      p3x,
      p3y,
      p4x,
      p4y,
      x1,
      y1,
      x2,
      y2,
      res,
    );
  } else if (type1 === 'bezier' && type2 === 'bezier') {
    bezierIntersection(params1, params2, res);
  } else {
    const curve1 = segmentToCurve(segment1, []);
    const curve2 = segmentToCurve(segment2, []);
    for (let i = 0; i < curve1.length; i++) {
      for (let j = 0; j < curve2.length; j++) {
        bezierIntersection(curve1[i], curve2[j], res);
      }
    }
  }

  return res;
}
