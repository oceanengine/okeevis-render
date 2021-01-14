export function pointInEllipseFill(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  x: number,
  y: number,
): boolean {
  return (x - cx) ** 2 / rx ** 2 + (y - cy) ** 2/ ry ** 2 <= 1;
}

export function pointInEllipseStroke(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  lineWidth: number,
  x: number,
  y: number,
): boolean {
  return (
    pointInEllipseFill(cx, cy, rx + lineWidth / 2, ry + lineWidth / 2, x, y) &&
    !pointInEllipseFill(cx, cy, rx - lineWidth / 2, ry - lineWidth / 2, x, y)
  );
}
