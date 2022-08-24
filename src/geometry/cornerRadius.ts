import { Vec2, subtract, angle, cross } from '../utils/vec2';


function vectorLength(p1: Vec2, p2: Vec2): number {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

interface CornderPoints {
  radius: number;
  startPoint: Vec2;
  endPoint: Vec2;
  startAngle: number;
  endAngle: number;
  center: Vec2;
  clocWise: boolean;
}

export function getPolylineCornerRadiusPoints(p1: Vec2, p2: Vec2, p3: Vec2, r: number): CornderPoints {
  const maxLen = Math.min(vectorLength(p1, p2), vectorLength(p2, p3));
  const clocWise = cross(subtract([0, 0], p3, p1), subtract([0, 0], p2, p1)) < 0;
  const p2Angle = angle(subtract([0, 0], p1, p2), subtract([0, 0], p3, p2));
  const rmax = Math.abs(maxLen * Math.tan(p2Angle / 2));
  const radius = Math.min(r, rmax);
  const startAngle = Math.atan2(p1[1] - p2[1], p1[0] - p2[0]);
  const midAngle = startAngle + (clocWise ? -1 : 1) * p2Angle / 2;
  const p2PointToCenterLength = radius / (Math.sin(p2Angle / 2));
  const offsetX = p2PointToCenterLength * Math.cos(midAngle);
  const offsetY = p2PointToCenterLength * Math.sin(midAngle);
  const cx = p2[0] + offsetX;
  const cy = p2[1] + offsetY;
  const startPointRotate = midAngle + Math.PI - (Math.PI / 2 - p2Angle / 2) * (clocWise ? 1 : -1)
  const endPointRotate = midAngle + Math.PI + (Math.PI / 2 - p2Angle / 2) * (clocWise ? 1 : -1);
  const startX = cx + radius * Math.cos(startPointRotate);
  const startY = cy + radius * Math.sin(startPointRotate);
  const endX = cx + radius * Math.cos(endPointRotate);
  const endY = cy + radius * Math.sin(endPointRotate);
  return {
    radius,
    startPoint: [startX, startY],
    endPoint: [endX, endY],
    startAngle: startPointRotate,
    endAngle: endPointRotate,
    center: [cx, cy],
    clocWise,
  }
}