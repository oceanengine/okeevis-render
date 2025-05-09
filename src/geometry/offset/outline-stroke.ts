import { first, last } from 'lodash-es';
import Path2D from '../Path2D';
import { offsetSegment } from './offset-segment';
import { segmentJoin } from './segment-join';
import { getPointAtSegment, reverseSegment, Segment } from '../pathSegment';

function runSegmentOnPath(path: Path2D, segment: Segment, isFirst: boolean = false) {
  if (segment.type === 'line') {
    const [x1, y1, x2, y2] = segment.params;
    if (isFirst) {
      path.moveTo(x1, y1);
    }
    path.lineTo(x2, y2);
  } else if (segment.type === 'arc') {
    const [cx, cy, r, startAngle, endAngle, anticlockwise] = segment.params;
    if (isFirst) {
      path.moveTo(cx + r * Math.cos(startAngle), cy + r * Math.sin(startAngle));
    }
    path.arc(cx, cy, r, startAngle, endAngle, !!anticlockwise);
  } else if (segment.type === 'bezier') {
    const [x1, y1, x2, y2, x3, y3, x4, y4] = segment.params;
    if (isFirst) {
      path.moveTo(x1, y1);
    }
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
    const outsideSegments = segments
      .map(segment => {
        return offsetSegment(segment, strokeWidth / 2);
      })
      .filter(seg => seg.length);
    const insideSegments = segments
      .map(segment => {
        return offsetSegment(segment, -strokeWidth / 2);
      })
      .filter(seg => seg.length)
      .reverse()
      .map(segs => segs.reverse().map(seg => reverseSegment(seg)));
    const [outerJoins, innerJoins] = [outsideSegments, insideSegments].map(pathSegments =>
      pathSegments.map((curSegs, index) => {
        const curLast = last(curSegs);
        if (pathSegments.length === 1) {
          return [];
        }
        let nextSegs = pathSegments[index + 1];
        if (index === pathSegments.length - 1 && isClosed) {
          nextSegs = pathSegments[0];
        }
        if (!nextSegs) {
          return [];
        }
        const nextFirst = nextSegs[0];
        return segmentJoin(curLast, nextFirst, strokeLineJoin, strokeWidth, strokeMiterLimit);
      }),
    );

    const addLineCap = (side: 'start' | 'end') => {
      const { x, y, alpha } = subPath.getPointAtPercent(side === 'start' ? 0 : 1);
      if (strokeLineCap === 'square') {
        const alpha1 = alpha + (Math.PI / 2) * (side === 'start' ? 1 : -1);
        const alpha2 = alpha1 + Math.PI / 4;
        const alpha4 = alpha2 + Math.PI / 2;
        const r = strokeWidth / 2;
        const r2 = r * Math.sqrt(2);
        if (side === 'start') {
          res.moveTo(x + r * Math.cos(alpha1), y + r * Math.sin(alpha1));
        }
        res.lineTo(x + r2 * Math.cos(alpha2), y + r2 * Math.sin(alpha2));
        res.lineTo(x + r2 * Math.cos(alpha4), y + r2 * Math.sin(alpha4));
      }
      if (strokeLineCap === 'round') {
        const startAngle = alpha + (Math.PI / 2) * (side === 'start' ? 1 : -1);
        const endAngle = startAngle + Math.PI;
        const r = strokeWidth / 2;
        if (side === 'start') {
          const startX = x + r * Math.cos(startAngle);
          const startY = y + r * Math.sin(startAngle);
          res.moveTo(startX, startY);
        }
        res.arc(x, y, r, startAngle, endAngle);
      }
    };

    if (isClosed || (strokeLineCap === 'butt' && !isClosed)) {
      if (outsideSegments.length) {
        const firstOuterPoint = getPointAtSegment(0, outsideSegments[0][0]);
        res.moveTo(firstOuterPoint.x, firstOuterPoint.y);
      }
    } else {
      addLineCap('start');
    }

    outerJoins.forEach((joins, index) => {
      outsideSegments[index].forEach(seg => runSegmentOnPath(res, seg));
      joins.forEach(seg => runSegmentOnPath(res, seg));
    });

    if (isClosed) {
      if (insideSegments.length) {
        const firstInnerPoint = getPointAtSegment(0, insideSegments[0][0]);
        res.moveTo(firstInnerPoint.x, firstInnerPoint.y);

      }
    } else {
      if (strokeLineCap === 'butt') {
        const firstInnerPoint = getPointAtSegment(0, insideSegments[0][0]);
        res.lineTo(firstInnerPoint.x, firstInnerPoint.y);
      } else {
        addLineCap('end');
      }
    }

    innerJoins.forEach((joins, index) => {
      insideSegments[index].forEach(seg => runSegmentOnPath(res, seg));
      joins.forEach(seg => runSegmentOnPath(res, seg));
    });
    res.closePath();
  }
  return res;
}
