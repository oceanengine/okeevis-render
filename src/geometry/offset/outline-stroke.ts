import { first, last } from 'lodash-es';
import Path2D from '../Path2D';
import { offsetSegment } from './offset-segment';
import { segmentJoin } from './segment-join';
import { getPointAtSegment, reverseSegment, Segment } from '../pathSegment';

function runSegmentOnPath(path: Path2D, segment: Segment) {
  if (segment.type === 'line') {
    const [x1, y1, x2, y2] = segment.params;
    path.lineTo(x2, y2);
  } else if (segment.type === 'arc') {
    const [cx, cy, r, startAngle, endAngle, anticlockwise] = segment.params;
    path.arc(cx, cy, r, startAngle, endAngle);
  } else if (segment.type === 'bezier') {
    const [x1, y1, x2, y2, x3, y3, x4, y4] = segment.params;
    path.bezierCurveTo(x2, y2, x3, y3, x4, y4);
  }
}

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
        if (index === 0) {
          const startPoint = getPointAtSegment(0, currentFirstSeg);
          if ((isClosed && mainIndex === 1)) {
            res.moveTo(startPoint.x, startPoint.y);
          } else if ((strokeLineCap === 'butt' && !isClosed)) {
            if (mainIndex === 0) {
              res.moveTo(startPoint.x, startPoint.y);
            } else {
              res.lineTo(startPoint.x, startPoint.y);
            }
          } else if (strokeLineCap === 'round' && !isClosed) {
            const {x, y, alpha} = subPath.getPointAtPercent(mainIndex === 0 ? 0 : 1);
            const startAngle = alpha + Math.PI / 2 * (mainIndex === 0 ? 1 : -1);
            const endAngle = startAngle + Math.PI;
            const r = strokeWidth / 2;
            if (mainIndex === 0) {
              const startX = x + r * Math.cos(startAngle);
              const startY = y + r * Math.sin(startAngle);
              res.moveTo(startX, startY);
            }
            res.arc(x, y, r, startAngle, endAngle);
          } else if (strokeLineCap === 'square' && !isClosed) {
            const {x, y, alpha} = subPath.getPointAtPercent(mainIndex === 0 ? 0 : 1);
            const alpha1 = alpha + Math.PI / 2 * (mainIndex === 0? 1 : -1);
            const alpha2 = alpha1 + Math.PI / 4;
            const alpha4 = alpha2 + Math.PI / 2;
            const r = strokeWidth / 2;
            const r2 = r * Math.sqrt(2);
            if (mainIndex === 0) {
              res.moveTo(x + r * Math.cos(alpha1), y + r * Math.sin(alpha1));
            }
            res.lineTo(x + r2 * Math.cos(alpha2), y + r2 * Math.sin(alpha2));
            res.lineTo(x + r2 * Math.cos(alpha4), y + r2 * Math.sin(alpha4));
          }
        }
        joinSegments.forEach(seg => {
          runSegmentOnPath(res, seg);
        });
        currentRestSegs.forEach(seg => {
          runSegmentOnPath(res, seg);
        });
        if (index === segments.length - 1 && mainIndex === 1) {
          res.closePath();
        }
        return curr;
      }, null);
    });
  }
  return res;
}
