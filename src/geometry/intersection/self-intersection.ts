
// 计算贝塞尔曲线是否自相交

export function selfIntersection(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
): number[] {
  const ax = x3 - 3 * x2 + 3 * x1 - x0;
  const bx = 3 * x2 - 6 * x1 + 3 * x0;
  const cx = 3 * x1 - 3 * x0;
  // const dx = x0;
  const ay = y3 - 3 * y2 +  3 * y1 - y0;
  const by = 3 * y2 - 6 * y1 + 3 * y0;
  const cy = 3 * y1 - 3 * y0;
  // const dy = y0;
  const fraction = ax * by - bx * ay; // 分母
  if (fraction === 0) {
    return [];
  }
  const u =  (ay * cx - ax * cy) / fraction;
  const v = (ax * u ** 2 + bx * u + cx) / ax;
  const d = u ** 2 - 4 * v; // 判别式

  if (d <= 0) {
    return [];
  }

  const t1 = (u - Math.sqrt(d)) / 2;
  const t2 = (u + Math.sqrt(d)) / 2;
  const roots = [t1, t2].filter(t => t >= 0 && t <= 1)
  return roots.length === 2  && roots[0] !== roots[1] ? roots: [];
}
