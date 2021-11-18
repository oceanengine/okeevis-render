export function pointInCircle(cx: number, cy: number, r: number, x: number, y: number): boolean {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy < r * r;
}

export function pointInCircleStroke(
  cx: number,
  cy: number,
  r: number,
  lineWidth: number,
  x: number,
  y: number,
) {
  return (
    pointInCircle(cx, cy, r + lineWidth / 2, x, y) &&
    !pointInCircle(cx, cy, r - lineWidth / 2, x, y)
  );
}
