


export function pointInCircle(cx: number, cy: number, r: number, x: number, y: number): boolean {
  const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
  return distance <= r;
}

export function pointInCircleStroke(cx: number, cy: number, r: number, lineWidth: number, x: number, y: number) {
  return pointInCircle(cx, cy, r + lineWidth / 2, x, y) && !pointInCircle(cx, cy, r - lineWidth / 2, x, y);
}