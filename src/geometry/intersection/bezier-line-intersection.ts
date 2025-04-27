import { cross } from '../../utils/vec2';
import type { PathIntersection } from '../Path2D';
import { pointAtBezier } from '../pathSegment';
import { getPolynomialRoots } from './polynomial';


/*computes intersection between a cubic spline and a line segment*/

export function bezierLineIntersection(
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number,
  p4x: number,
  p4y: number,
  a1x: number,
  a1y: number,
  a2x: number,
  a2y: number,
  result: PathIntersection[] = [],
): PathIntersection[] {
  var ax: number,
    ay: number,
    bx: number,
    by: number,
    cx: number,
    cy: number,
    dx: number,
    dy: number; // temporary variables
  var c3x: number,
    c3y: number,
    c2x: number,
    c2y: number,
    c1x: number,
    c1y: number,
    c0x: number,
    c0y: number; // coefficients of cubic
  var cl; // c coefficient for normal form of line
  var nx, ny; // normal for normal form of line

  // used to determine if point is on line segment
  var minx = Math.min(a1x, a2x),
    miny = Math.min(a1y, a2y),
    maxx = Math.max(a1x, a2x),
    maxy = Math.max(a1y, a2y);

  // Start with Bezier using Bernstein polynomials for weighting functions:
  //     (1-t^3)P1 + 3t(1-t)^2P2 + 3t^2(1-t)P3 + t^3P4
  //
  // Expand and collect terms to form linear combinations of original Bezier
  // controls.  This ends up with a vector cubic in t:
  //     (-P1+3P2-3P3+P4)t^3 + (3P1-6P2+3P3)t^2 + (-3P1+3P2)t + P1
  //             /\                  /\                /\       /\
  //             ||                  ||                ||       ||
  //             c3                  c2                c1       c0

  // Calculate the coefficients
  ax = p1x * -1;
  ay = p1y * -1;
  bx = p2x * 3;
  by = p2y * 3;
  cx = p3x * -3;
  cy = p3y * -3;
  dx = ax + bx + cx + p4x;
  dy = ay + by + cy + p4y;
  c3x = dx;
  c3y = dy; // vec

  ax = p1x * 3;
  ay = p1y * 3;
  bx = p2x * -6;
  by = p2y * -6;
  cx = p3x * 3;
  cy = p3y * 3;
  dx = ax + bx + cx;
  dy = ay + by + cy;
  c2x = dx;
  c2y = dy; // vec

  ax = p1x * -3;
  ay = p1y * -3;
  bx = p2x * 3;
  by = p2y * 3;
  cx = ax + bx;
  cy = ay + by;
  c1x = cx;
  c1y = cy; // vec

  c0x = p1x;
  c0y = p1y;

  // Convert line to normal form: ax + by + c = 0
  // Find normal to line: negative inverse of original line's slope
  nx = a1y - a2y;
  ny = a2x - a1x;

  // Determine new c coefficient
  cl = a1x * a2y - a2x * a1y;

  // ?Rotate each cubic coefficient using line for new coordinate system?
  // Find roots of rotated cubic
  var roots = getPolynomialRoots(
    // dot products => x * x + y * y
    nx * c3x + ny * c3y,
    nx * c2x + ny * c2y,
    nx * c1x + ny * c1y,
    nx * c0x + ny * c0y + cl,
  );

  // Any roots in closed interval [0,1] are intersections on Bezier, but
  // might not be on the line segment.
  // Find intersections and calculate point coordinates
  for (var i = 0; i < roots.length; i++) {
    var t = roots[i];

    if (0 <= t && t <= 1) {
      // We're within the Bezier curve
      // Find point on Bezier
      // lerp: x1 + (x2 - x1) * t
      var p5x = p1x + (p2x - p1x) * t;
      var p5y = p1y + (p2y - p1y) * t; // lerp(p1, p2, t);

      var p6x = p2x + (p3x - p2x) * t;
      var p6y = p2y + (p3y - p2y) * t;

      var p7x = p3x + (p4x - p3x) * t;
      var p7y = p3y + (p4y - p3y) * t;

      var p8x = p5x + (p6x - p5x) * t;
      var p8y = p5y + (p6y - p5y) * t;

      var p9x = p6x + (p7x - p6x) * t;
      var p9y = p6y + (p7y - p6y) * t;

      // candidate
      var p10x = p8x + (p9x - p8x) * t;
      var p10y = p8y + (p9y - p8y) * t;
      const { alpha } = pointAtBezier(t, p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y);
      const crossValue = cross([a2x - a1x, a2y - a1y], [Math.cos(alpha), Math.sin(alpha)]);
      const winding = crossValue > 0 ? 1 : -1;
      const point: PathIntersection = {
        t1: t,
        t2: (p10x - a1x) / (a2x - a1x),
        x: p10x,
        y: p10y,
        winding,
      };
      // See if point is on line segment
      if (a1x === a2x) {
        // vertical
        if (miny <= p10y && p10y <= maxy) {
          if (result) result.push(point);
          else return [];
        }
      } else if (a1y === a2y) {
        // horizontal
        if (minx <= p10x && p10x <= maxx) {
          if (result) result.push(point);
          else return [];
        }
      } else if (p10x >= minx && p10y >= miny && p10x <= maxx && p10y <= maxy) {
        if (result) result.push(point);
        else return [];
      }
    }
  }
  return result;
}
