import { first, last } from 'lodash-es';
import Path2D from '../Path2D';
import { offsetSegment } from './offset-segment';
import { segmentJoin } from './segment-join';
import { getPointAtSegment, reverseSegment, Segment } from '../pathSegment';

export interface StrokeOptions {
  strokeAlign: 'center' | 'inside' | 'outside';
  strokeWidth: number;
  strokeMiterLimit: number;
  strokeLineCap: 'butt' | 'round' | 'square';
  strokeLineJoin: 'miter' | 'round' | 'bevel';
  // strokeDash: number[];
  // strokeDashOffset: number;
  strokeCornerRadius: number;
  viewportWidth?: number;
  viewportHeight?: number;
}

export function outlineStroke(path: Path2D, options: StrokeOptions): Path2D {
  const subPathList = path.getSubpaths();
  const {
    strokeAlign,
    strokeWidth,
    strokeMiterLimit,
    strokeLineCap,
    strokeLineJoin,
    strokeCornerRadius,
  } = options;
  const res: Path2D = new Path2D();
  for (const subPath of subPathList) {
    const segments = subPath.getSegments();
    const isClosed = subPath.isClosed();
    const outsideSegments = segments.map(segment => {
      return offsetSegment(segment, strokeWidth / 2);
    });
    const insideSegments = segments
      .map(segment => {
        return offsetSegment(segment, -strokeWidth / 2);
      })
      .reverse()
      .map(segs => segs.reverse().map(seg => reverseSegment(seg)));
    const allSegments: Segment[] = [];
    [outsideSegments, insideSegments].forEach((segments, mainIndex) => {
      segments.reduce((prev, curr, index) => {
        const prevLastSeg = prev ? last(prev) : null;
        const [currentFirstSeg, ...currentRestSegs] = curr;
        const joinSegments = segmentJoin(
          prevLastSeg,
          currentFirstSeg,
          strokeLineJoin,
          strokeWidth,
          strokeMiterLimit,
        );
        allSegments.push(...joinSegments);
        allSegments.push(...currentRestSegs);
        if (index === segments.length - 1 && !isClosed) {
          if (mainIndex === 0) {
            const lastSegment = last(last(outsideSegments));
            const firstSegment = first(insideSegments)[0];
            const p1 = getPointAtSegment(1, lastSegment);
            const p2 = getPointAtSegment(0, firstSegment);
            allSegments.push({
              type: 'line',
              params: [p1.x, p1.y, p2.x, p2.y],
            });
          } else {
            const lastSegment = last(last(insideSegments));
            const firstSegment = first(outsideSegments)[0];
            const p1 = getPointAtSegment(1, lastSegment);
            const p2 = getPointAtSegment(0, firstSegment);
            allSegments.push({
              type: 'line',
              params: [p1.x, p1.y, p2.x, p2.y],
            });
          }
        }
        return curr;
      }, null);
    });
    allSegments.forEach((segment, index) => {
      if (index === 0) {
        const point = getPointAtSegment(0, segment);
        res.moveTo(point.x, point.y);
      }
      if (segment.type === 'line') {
        const [x1, y1, x2, y2] = segment.params;
        res.lineTo(x2, y2);
      } else if (segment.type === 'arc') {
        const [cx, cy, r, startAngle, endAngle, anticlockwise] = segment.params;
        res.arc(cx, cy, r, startAngle, endAngle);
      } else if (segment.type === 'bezier') {
        const [x1, y1, x2, y2, x3, y3, x4, y4] = segment.params;
        res.bezierCurveTo(x2, y2, x3, y3, x4, y4);
      }
    });
  }
  return res;
}
