
import * as vec2 from '../../utils/vec2';



export function pointInLineStroke(x1: number, y1: number, x2: number, y2: number, lineWidth: number, x: number, y: number): boolean {
  return pointDistanceToLine(x1, y1, x2, y2, x, y) <= lineWidth / 2
}

function pointDistanceToLine(x1: number, y1: number, x2: number, y2: number, x: number, y: number): number {
  // 斜率的向量
  const d = [x2 - x1, y2 - y1] as vec2.Vec2;
  // 如果端点相等，则判定点到点的距离
  if (vec2.exactEquals(d, [0, 0])) {
    return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
  }
  // 垂直线向量
  const u = [-d[1], d[0]] as vec2.Vec2;
  vec2.normalize(u, u);
  // 检测点到其中一个端点的向量
  const a = [x - x1, y - y1] as vec2.Vec2;
  // 通过点乘计算 distance = |a| * cos
  return Math.abs(vec2.dot(a, u));
}