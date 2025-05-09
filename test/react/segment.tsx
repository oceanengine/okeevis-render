import { Segment } from '../../src/geometry/pathSegment';
import React from '../../src/react';
import { Line, Path, Arc } from '../../src';
import Path2D from '../../src/geometry/Path2D';

export const SegmentLine = (props: {
  segment: Segment;
  stroke?: string;
  fill?: string;
  lineWidth?: number;
}) => {
  const { segment, stroke = 'red', fill = 'none', lineWidth = 1 } = props;
  if (segment.type === 'line') {
    const [x1, y1, x2, y2] = segment.params;
    return (
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} fill={fill} lineWidth={lineWidth} />
    );
  } else if (segment.type === 'bezier') {
    const [x1, y1, x2, y2, x3, y3, x4, y4 ] = segment.params;
    return (
      <Path
        pathData={new Path2D(`M${x1} ${y1} C${x2} ${y2} ${x3} ${y3} ${x4} ${y4}`)}
        stroke={stroke}
        fill={fill}
        lineWidth={lineWidth}
      />
    );
  } else if (segment.type === 'arc') {
    const [cx, cy, radius, startAngle, endAngle ] = segment.params;
    return (
      <Arc
        cx={cx}
        cy={cy}
        radius={radius}
        start={startAngle}
        end={endAngle}
        stroke={stroke}
        fill={fill}
        lineWidth={lineWidth}
      />
    );
  }
};
