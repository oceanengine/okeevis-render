import { equalWithTolerance } from '../../utils/math';
import { BBox, bboxIntersect } from '../../utils/bbox';
import { PathIntersection } from '../Path2D';
import { divideBezierAt } from '../bezierSubdivision';
import { pointAtBezier } from '../pathSegment';

const threshold = 0.1;
export function bezierIntersection(
  curve1: number[],
  curve2: number[],
  res: PathIntersection[] = [],
): PathIntersection[] {
  recursiveBezierIntersection(curve1, curve2, 0, 1, 0, 1, res);
  // uniq points
  const uniqRes = res.filter((item, index) => {
    return res.findIndex(v => equalWithTolerance(v.x, item.x, threshold) && equalWithTolerance(v.y, item.y, threshold)) === index;
  });
  res.length = uniqRes.length;
  res.forEach((item, i) => res[i] = uniqRes[i]);
  return res;
}

function recursiveBezierIntersection(
  curve1: number[],
  curve2: number[],
  t1min: number, t1max: number, t2min: number, t2max: number, res: PathIntersection[] = [],
) {
  const t1 = (t1min + t1max) / 2;
  const t2 = (t2min + t2max) / 2;
  const bbox1 = bezierBBox(curve1);
  const bbox2 = bezierBBox(curve2);
  const intersection = bboxIntersect(bbox1, bbox2);
  if (!intersection) {
    return;
  }
  if (bbox1.width + bbox1.height < threshold && bbox2.width + bbox2.height < threshold) {
    const point = pointAtBezier(
      0.5,
      curve2[0],
      curve2[1],
      curve2[2],
      curve2[3],
      curve2[4],
      curve2[5],
      curve2[6],
      curve2[7],
    );
    res.push({
      x: point.x,
      y: point.y,
      t1,
      t2,
      winding: 1,
    });
    return;
  }
  const [curve1Left, curve1Right] = divideBezierAt(curve1, 0.5);
  const [curve2Left, curve2Right] = divideBezierAt(curve2, 0.5);
  recursiveBezierIntersection(curve1Left, curve2Left, t1min, t1, t2min, t2, res);
  recursiveBezierIntersection(curve1Left, curve2Right, t1, t1, t2, t2max, res);
  recursiveBezierIntersection(curve1Right, curve2Left, t1, t1max, t2min, t2, res);
  recursiveBezierIntersection(curve1Right, curve2Right, t1, t1max, t2, t2max, res);
}

function bezierBBox(curve: number[]): BBox {
  const [pax, pay, pbx, pby, pcx, pcy, pdx, pdy] = curve;
  const minx = Math.min(pax, pbx, pcx, pdx);
  const miny = Math.min(pay, pby, pcy, pdy);
  const maxx = Math.max(pax, pbx, pcx, pdx);
  const maxy = Math.max(pay, pby, pcy, pdy);
  return {
    x: minx,
    y: miny,
    width: maxx - minx,
    height: maxy - miny,
  };
}
