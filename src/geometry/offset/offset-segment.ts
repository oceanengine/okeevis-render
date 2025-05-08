import { Segment } from '../pathSegment';
import { CubicCurve, FloatPoint, CubicCurveBuilder, offsetCurve } from '../../../js/offsetting';

export function offsetSegment(segment: Segment, d: number): Segment[] {
  if (segment.type === 'line') {
    const [x1, y1, x2, y2] = segment.params;
    const alpha = Math.atan2(y2 - y1, x2 - x1);
    const normalAngle = alpha - Math.PI / 2;
    const dx = Math.cos(normalAngle) * d;
    const dy = Math.sin(normalAngle) * d;
    return [
      {
        type: 'line',
        params: [x1 + dx, y1 + dy, x2 + dx, y2 + dy],
      },
    ];
  } else if (segment.type === 'arc') {
    const [cx, cy, r, startAngle, endAngle, flag] = segment.params;
    const r2 = Math.max(r + d * (flag ? -1 : 1), 0);
    if (r > 0) {
      return [
        {
          type: 'arc',
          params: [cx, cy, r2, startAngle, endAngle, flag],
        },
      ];
    } else {
      return [];
    }
  } else if (segment.type === 'bezier') {
    const [x1, y1, c1x, c1y, c2x, c2y, x2, y2] = segment.params;
    const curve = new CubicCurve(
      new FloatPoint(x1, y1),
      new FloatPoint(c1x, c1y),
      new FloatPoint(c2x, c2y),
      new FloatPoint(x2, y2),
    );
    const accuracy = 0.005 + (0.0001 - 0.005) * 0.5;
    const builder = new CubicCurveBuilder();
    offsetCurve(curve, d, accuracy, builder);
    return builder.segments.map(curve => {
      const { P0, P1, P2, P3 } = curve;
      return {
        type: 'bezier',
        params: [P0.X, P0.Y, P1.X, P1.Y, P2.X, P2.Y, P3.X, P3.Y],
      };
    });
  }
}
