// copy from https://github.com/aurimasg/cubic-bezier-offsetter/blob/main/JavaScript/offsetting.js
const NearCuspPointSearchMaxIterationCount = 18;
const MaximumTinyCurvePolygonPerimeterSquared = 1e-7;
const MinimumArcRadius = 1e-8;
const MaximumArcRadius = 1e6;
const CuspDerivativeLengthSquared = 1.5e-4;
const CurvePointClumpTestEpsilon = 1e-14;
const ArcCenterComparisonEpsilon = 1e-8;
const ApproximatelyStraightCurveTestApsilon = 1e-5;
const CompletelyStraightCurveTestApsilon = 1e-15;
const ArcProbePositions = [0.2, 0.4, 0.6, 0.8];
const SimpleOffsetProbePositions = [0.25, 0.5, 0.85];
function fuzzyIsEqual(a, b) {
    return Math.abs(a - b) < Number.EPSILON;
}
function fuzzyIsZero(a) {
    return Math.abs(a) < Number.EPSILON;
}
function isEqualWithEpsilon(a, b, epsilon) {
    return Math.abs(a - b) < epsilon;
}
function isZeroWithEpsilon(a, epsilon) {
    return Math.abs(a) < epsilon;
}
function deg2Rad(x) {
    return x * (Math.PI / 180.0);
}
function rad2Deg(x) {
    return x * (180.0 / Math.PI);
}
function clamp(val, min, max) {
    return val > max ? max : val < min ? min : val;
}
function interpolateLinear(A, B, t) {
    return A + (B - A) * t;
}
function max3(a, b, c) {
    return Math.max(a, Math.max(b, c));
}
function min3(a, b, c) {
    return Math.min(a, Math.min(b, c));
}
function max4(a, b, c, d) {
    return Math.max(a, Math.max(b, Math.max(c, d)));
}
function min4(a, b, c, d) {
    return Math.min(a, Math.min(b, Math.min(c, d)));
}
function acceptRoot(root) {
    if (root < -Number.EPSILON) {
        return [];
    } else if (root > 1.0 + Number.EPSILON) {
        return [];
    }
    return [clamp(root, 0.0, 1.0)];
}
function findQuadraticRoots(a, b, c) {
    const delta = b * b - 4.0 * a * c;
    if (delta < 0) {
        return [];
    }
    if (delta > 0.0) {
        const d = Math.sqrt(delta);
        const q = -0.5 * (b + (b < 0.0 ? -d : d));
        const rv0 = q / a;
        const rv1 = c / q;
        if (fuzzyIsEqual(rv0, rv1)) {
            return acceptRoot(rv0);
        }
        if (rv0 < rv1) {
            let roots = acceptRoot(rv0);
            roots.concat(acceptRoot(rv1));
            return roots;
        } else {
            let roots = acceptRoot(rv1);
            roots.concat(acceptRoot(rv0));
            return roots;
        }
    }
    if (a != 0) {
        return acceptRoot((-0.5 * b) / a);
    }
    return [];
}
function arrayContainsFloat(array, value) {
    for (let i = 0; i < array.length; i++) {
        if (fuzzyIsEqual(array[i], value)) {
            return true;
        }
    }
    return false;
}
function deduplicateFloatArray(array) {
    let rv = [];
    for (let i = 0; i < array.length; i++) {
        if (!arrayContainsFloat(rv, array[i])) {
            rv.push(array[i]);
        }
    }
    return rv;
}
function findCubicRoots(coe0, coe1, coe2, coe3) {
    if (fuzzyIsZero(coe0)) {
        return findQuadraticRoots(coe1, coe2, coe3);
    }
    const inva = 1.0 / coe0;
    const a = coe1 * inva;
    const b = coe2 * inva;
    const c = coe3 * inva;
    const Q = (a * a - b * 3.0) / 9.0;
    const R = (2.0 * a * a * a - 9.0 * a * b + 27.0 * c) / 54.0;
    const R2 = R * R;
    const Q3 = Q * Q * Q;
    const R2subQ3 = R2 - Q3;
    const adiv3 = a / 3.0;
    if (R2subQ3 < 0.0) {
        const theta = Math.acos(clamp(R / Math.sqrt(Q3), -1.0, 1.0));
        const negative2RootQ = -2.0 * Math.sqrt(Q);
        const x0 = negative2RootQ * Math.cos(theta / 3.0) - adiv3;
        const x1 =
            negative2RootQ * Math.cos((theta + 2.0 * Math.PI) / 3.0) - adiv3;
        const x2 =
            negative2RootQ * Math.cos((theta - 2.0 * Math.PI) / 3.0) - adiv3;
        let roots = acceptRoot(x0);
        roots = roots.concat(acceptRoot(x1));
        roots = roots.concat(acceptRoot(x2));
        roots.sort();
        return deduplicateFloatArray(roots);
    }
    let A = Math.abs(R) + Math.sqrt(R2subQ3);
    A = Math.pow(A, 1.0 / 3.0);
    if (R > 0.0) {
        A = -A;
    }
    if (A != 0.0) {
        A += Q / A;
    }
    return acceptRoot(A - adiv3);
}
const TrianglePointOrientationClockwise = 0;
const TrianglePointOrientationCounterClockwise = 1;
const TrianglePointOrientationCollinear = 2;
export class FloatPoint {
    static zero = new FloatPoint(0, 0);
    X = 0;
    Y = 0;
    constructor(x, y) {
        this.X = x;
        this.Y = y;
    }
    static turn(p0, p1, p2) {
        return p1.minus(p0).cross(p2.minus(p0));
    }
    static determineTriangleOrientation(p0, p1, p2) {
        const t = FloatPoint.turn(p0, p1, p2);
        if (fuzzyIsZero(t)) {
            return TrianglePointOrientationCollinear;
        } else if (t > 0.0) {
            return TrianglePointOrientationClockwise;
        }
        return TrianglePointOrientationCounterClockwise;
    }
    static isTriangleClockwise(p0, p1, p2) {
        return (
            FloatPoint.determineTriangleOrientation(p0, p1, p2) ===
            TrianglePointOrientationClockwise
        );
    }
    equals(point) {
        return fuzzyIsEqual(point.X, this.X) && fuzzyIsEqual(point.Y, this.Y);
    }
    equalsWithEpsilon(point, epsilon) {
        return (
            isEqualWithEpsilon(point.X, this.X, epsilon) &&
            isEqualWithEpsilon(point.Y, this.Y, epsilon)
        );
    }
    distanceTo(point) {
        return point.minus(this).length();
    }
    distanceToSquared(point) {
        return point.minus(this).lengthSquared();
    }
    length() {
        return Math.sqrt(this.lengthSquared());
    }
    lengthSquared() {
        return this.X * this.X + this.Y * this.Y;
    }
    unitVector() {
        const mag2 = this.lengthSquared();
        if (mag2 != 0.0 && mag2 != 1.0) {
            const length = Math.sqrt(mag2);
            return new FloatPoint(this.X / length, this.Y / length);
        }
        return this;
    }
    normalVector() {
        return new FloatPoint(this.Y, -this.X);
    }
    unitNormalVector() {
        return this.normalVector().unitVector();
    }
    cross(point) {
        return this.X * point.Y - this.Y * point.X;
    }
    dot(point) {
        return this.X * point.X + this.Y * point.Y;
    }
    rotated90CCW() {
        return new FloatPoint(this.Y, -this.X);
    }
    lerp(to, t) {
        return this.plus(to.minus(this).multiplyScalar(t));
    }
    plus(point) {
        return new FloatPoint(this.X + point.X, this.Y + point.Y);
    }
    minus(point) {
        return new FloatPoint(this.X - point.X, this.Y - point.Y);
    }
    multiply(point) {
        return new FloatPoint(this.X * point.X, this.Y * point.Y);
    }
    multiplyScalar(v) {
        return new FloatPoint(this.X * v, this.Y * v);
    }
    divide(point) {
        return new FloatPoint(this.X / point.X, this.Y / point.Y);
    }
    divideScalar(v) {
        return new FloatPoint(this.X / v, this.Y / v);
    }
}
const LineIntersectionKindNone = 0;
const LineIntersectionKindBounded = 1;
const LineIntersectionKindUnbounded = 2;
class LineIntersection {
    static noIntersection = new LineIntersection(
        LineIntersectionKindNone,
        FloatPoint.zero,
    );
    constructor(kind, intersectionPoint) {
        this.Kind = kind;
        this.IntersectionPoint = intersectionPoint;
    }
    Kind = LineIntersectionKindNone;
    IntersectionPoint = FloatPoint.zero;
}
class FloatLine {
    static zero = new FloatLine(FloatPoint.zero, FloatPoint.zero);
    P0 = FloatPoint.zero;
    P1 = FloatPoint.zero;
    constructor(p0, p1) {
        this.P0 = p0;
        this.P1 = p1;
    }
    x0() {
        return this.P0.X;
    }
    y0() {
        return this.P0.Y;
    }
    x1() {
        return this.P1.X;
    }
    y1() {
        return this.P1.Y;
    }
    dx() {
        return this.P1.X - this.P0.X;
    }
    dy() {
        return this.P1.Y - this.P0.Y;
    }
    isPoint() {
        return (
            fuzzyIsEqual(this.P0.X, this.P1.X) &&
            fuzzyIsEqual(this.P0.Y, this.P1.Y)
        );
    }
    isPointWithEpsilon(epsilon) {
        return (
            isEqualWithEpsilon(this.P0.X, this.P1.X, epsilon) &&
            isEqualWithEpsilon(this.P0.Y, this.P1.Y, epsilon)
        );
    }
    getDegreesToLine(l) {
        return rad2Deg(this.getRadiansToLine(l));
    }
    getRadiansToLine(l) {
        if (this.isPoint() || l.isPoint()) {
            return 0;
        }
        const c =
            (this.dx() * l.dx() + this.dy() * l.dy()) /
            (this.length() * l.length());
        const epsilon = Number.EPSILON * 8.0;
        if (c >= -1.0 - epsilon && c <= 1.0 + epsilon) {
            return Math.acos(clamp(c, -1.0, 1.0));
        }
        return 0;
    }
    angle() {
        const dx = this.P1.X - this.P0.X;
        const dy = this.P1.Y - this.P0.Y;
        const theta = rad2Deg(Math.atan2(-dy, dx));
        const thetaNormalized = theta < 0 ? theta + 360 : theta;
        if (fuzzyIsEqual(thetaNormalized, 360.0)) {
            return 0;
        }
        if (fuzzyIsZero(thetaNormalized)) {
            return 0;
        }
        return thetaNormalized;
    }
    length() {
        const x = this.P1.X - this.P0.X;
        const y = this.P1.Y - this.P0.Y;
        return Math.sqrt(x * x + y * y);
    }
    lengthSquared() {
        const x = this.P1.X - this.P0.X;
        const y = this.P1.Y - this.P0.Y;
        return x * x + y * y;
    }
    reversed() {
        return new FloatLine(this.P1, this.P0);
    }
    unitVector() {
        return this.P1.minus(this.P0).unitVector();
    }
    normalVector() {
        return new FloatPoint(this.dy(), -this.dx());
    }
    unitNormalVector() {
        return this.normalVector().unitVector();
    }
    intersect(l) {
        const a = this.P1.minus(this.P0);
        const b = l.P0.minus(l.P1);
        const denominator = a.Y * b.X - a.X * b.Y;
        if (denominator == 0) {
            return LineIntersection.noIntersection;
        }
        const c = this.P0.minus(l.P0);
        const reciprocal = 1.0 / denominator;
        const na = (b.Y * c.X - b.X * c.Y) * reciprocal;
        const point = this.P0.plus(a.multiplyScalar(na));
        if (na < 0 || na > 1) {
            return new LineIntersection(LineIntersectionKindUnbounded, point);
        }
        const nb = (a.X * c.Y - a.Y * c.X) * reciprocal;
        if (nb < 0 || nb > 1) {
            return new LineIntersection(LineIntersectionKindUnbounded, point);
        }
        return new LineIntersection(LineIntersectionKindBounded, point);
    }
    intersectSimple(l) {
        const a = this.P1.minus(this.P0);
        const b = l.P0.minus(l.P1);
        const denominator = a.Y * b.X - a.X * b.Y;
        if (denominator == 0) {
            return null;
        }
        const c = this.P0.minus(l.P0);
        const reciprocal = 1.0 / denominator;
        const na = (b.Y * c.X - b.X * c.Y) * reciprocal;
        return this.P0.plus(a.multiplyScalar(na));
    }
    translated(p) {
        return new FloatLine(this.P0.plus(p), this.P1.plus(p));
    }
    midPoint() {
        return new FloatPoint(
            (this.P0.X + this.P1.X) * 0.5,
            (this.P0.Y + this.P1.Y) * 0.5,
        );
    }
    extendByLengthFront(length) {
        if (this.isPoint() || fuzzyIsZero(length)) {
            return;
        }
        const v = this.unitVector();
        this.P1 = new FloatPoint(
            this.P1.X + v.X * length,
            this.P1.Y + v.Y * length,
        );
    }
    extendByLengthBack(length) {
        if (this.isPoint() || fuzzyIsZero(length)) {
            return;
        }
        const v = this.unitVector();
        this.P0 = new FloatPoint(
            this.P0.X - v.X * length,
            this.P0.Y - v.Y * length,
        );
    }
    isPointOnLineSegmentWithEpsilon(point, epsilon) {
        const cross =
            (point.Y - this.P0.Y) * (this.P1.X - this.P0.X) -
            (point.X - this.P0.X) * (this.P1.Y - this.P0.Y);
        if (Math.abs(cross) > epsilon) {
            return false;
        }
        const dot =
            (point.X - this.P0.X) * (this.P1.X - this.P0.X) +
            (point.Y - this.P0.Y) * (this.P1.Y - this.P0.Y);
        if (dot < 0) {
            return false;
        }
        const sql =
            (this.P1.X - this.P0.X) * (this.P1.X - this.P0.X) +
            (this.P1.Y - this.P0.Y) * (this.P1.Y - this.P0.Y);
        return dot <= sql;
    }
    isPointOnLineSegment(point) {
        return this.isPointOnLineSegmentWithEpsilon(point, Number.EPSILON);
    }
    isPointOnLineWithEpsilon(point, epsilon) {
        const cross =
            (point.Y - this.P0.Y) * (this.P1.X - this.P0.X) -
            (point.X - this.P0.X) * (this.P1.Y - this.P0.Y);
        return Math.abs(cross) <= epsilon;
    }
    isPointOnLine(point) {
        return this.isPointOnLineWithEpsilon(point, Number.EPSILON);
    }
}
export class CubicCurve {
    P0 = FloatPoint.zero;
    P1 = FloatPoint.zero;
    P2 = FloatPoint.zero;
    P3 = FloatPoint.zero;
    constructor(p0, p1, p2, p3) {
        this.P0 = p0;
        this.P1 = p1;
        this.P2 = p2;
        this.P3 = p3;
    }
    static createFromQuadratic(p0, p1, p2) {
        return new CubicCurve(
            p0,
            new FloatPoint(
                p0.X + (2.0 / 3.0) * (p1.X - p0.X),
                p0.Y + (2.0 / 3.0) * (p1.Y - p0.Y),
            ),
            new FloatPoint(
                p1.X + (1.0 / 3.0) * (p2.X - p1.X),
                p1.Y + (1.0 / 3.0) * (p2.Y - p1.Y),
            ),
            p2,
        );
    }
    static createFromLine(p0, p1) {
        return new CubicCurve(
            p0,
            new FloatPoint(
                p0.X + (1.0 / 3.0) * (p1.X - p0.X),
                p0.Y + (1.0 / 3.0) * (p1.Y - p0.Y),
            ),
            new FloatPoint(
                p0.X + (2.0 / 3.0) * (p1.X - p0.X),
                p0.Y + (2.0 / 3.0) * (p1.Y - p0.Y),
            ),
            p1,
        );
    }
    isPointWithEpsilon(epsilon) {
        return (
            this.P0.equalsWithEpsilon(this.P3, epsilon) &&
            this.P0.equalsWithEpsilon(this.P1, epsilon) &&
            this.P0.equalsWithEpsilon(this.P2, epsilon)
        );
    }
    isPoint() {
        return this.isPointWithEpsilon(Number.EPSILON);
    }
    isStraight() {
        const minx = Math.min(this.P0.X, this.P3.X);
        const miny = Math.min(this.P0.Y, this.P3.Y);
        const maxx = Math.max(this.P0.X, this.P3.X);
        const maxy = Math.max(this.P0.Y, this.P3.Y);
        return (
            minx <= this.P1.X &&
            miny <= this.P1.Y &&
            maxx >= this.P1.X &&
            maxy >= this.P1.Y &&
            minx <= this.P2.X &&
            miny <= this.P2.Y &&
            maxx >= this.P2.X &&
            maxy >= this.P2.Y &&
            fuzzyIsZero(FloatPoint.turn(this.P0, this.P1, this.P3)) &&
            fuzzyIsZero(FloatPoint.turn(this.P0, this.P2, this.P3))
        );
    }
    startTangentWithEpsilon(epsilon) {
        if (this.P0.equalsWithEpsilon(this.P1, epsilon)) {
            if (this.P0.equalsWithEpsilon(this.P2, epsilon)) {
                return new FloatLine(this.P0, this.P3);
            }
            return new FloatLine(this.P0, this.P2);
        }
        return new FloatLine(this.P0, this.P1);
    }
    startTangent() {
        return this.startTangentWithEpsilon(Number.EPSILON);
    }
    endTangentWithEpsilon(epsilon) {
        if (this.P3.equalsWithEpsilon(this.P2, epsilon)) {
            if (this.P3.equalsWithEpsilon(this.P1, epsilon)) {
                return new FloatLine(this.P3, this.P0);
            }
            return new FloatLine(this.P3, this.P1);
        }
        return new FloatLine(this.P3, this.P2);
    }
    endTangent() {
        return this.endTangentWithEpsilon(Number.EPSILON);
    }
    pointAt(t) {
        const it = 1.0 - t;
        const a0 = this.P0.multiplyScalar(it).plus(this.P1.multiplyScalar(t));
        const b0 = this.P1.multiplyScalar(it).plus(this.P2.multiplyScalar(t));
        const c0 = this.P2.multiplyScalar(it).plus(this.P3.multiplyScalar(t));
        const a1 = a0.multiplyScalar(it).plus(b0.multiplyScalar(t));
        const b1 = b0.multiplyScalar(it).plus(c0.multiplyScalar(t));
        return a1.multiplyScalar(it).plus(b1.multiplyScalar(t));
    }
    normalVector(t) {
        if (fuzzyIsZero(t)) {
            if (this.P0.equals(this.P1)) {
                if (this.P0.equals(this.P2)) {
                    return new FloatLine(this.P0, this.P3).normalVector();
                } else {
                    return new FloatLine(this.P0, this.P2).normalVector();
                }
            }
        } else if (fuzzyIsEqual(t, 1.0)) {
            if (this.P2.equals(this.P3)) {
                if (this.P1.equals(this.P3)) {
                    return new FloatLine(this.P0, this.P3).normalVector();
                } else {
                    return new FloatLine(this.P1, this.P3).normalVector();
                }
            }
        }
        const d = this.derivedAt(t);
        return new FloatPoint(d.Y, -d.X);
    }
    unitNormalVector(t) {
        const n = this.normalVector(t);
        return n.unitVector();
    }
    derivedAt(t) {
        const it = 1.0 - t;
        const d = t * t;
        const a = -it * it;
        const b = 1.0 - 4.0 * t + 3.0 * d;
        const c = 2.0 * t - 3.0 * d;
        return new FloatPoint(
            a * this.P0.X + b * this.P1.X + c * this.P2.X + d * this.P3.X,
            a * this.P0.Y + b * this.P1.Y + c * this.P2.Y + d * this.P3.Y,
        ).multiplyScalar(3.0);
    }
    secondDerivedAt(t) {
        const a = 2.0 - 2.0 * t;
        const b = -4.0 + 6.0 * t;
        const c = 2.0 - 6.0 * t;
        const d = 2.0 * t;
        return new FloatPoint(
            a * this.P0.X + b * this.P1.X + c * this.P2.X + d * this.P3.X,
            a * this.P0.Y + b * this.P1.Y + c * this.P2.Y + d * this.P3.Y,
        ).multiplyScalar(3.0);
    }
    getSubcurve(t0, t1) {
        if (fuzzyIsEqual(t0, t1)) {
            const p = this.pointAt(t0);
            return new CubicCurve(p, p, p, p);
        }
        if (t0 <= Number.EPSILON) {
            if (t1 >= 1.0 - Number.EPSILON) {
                return this;
            }
            const ab = this.P0.lerp(this.P1, t1);
            const bc = this.P1.lerp(this.P2, t1);
            const cd = this.P2.lerp(this.P3, t1);
            const abc = ab.lerp(bc, t1);
            const bcd = bc.lerp(cd, t1);
            const abcd = abc.lerp(bcd, t1);
            return new CubicCurve(this.P0, ab, abc, abcd);
        }
        if (t1 >= 1.0 - Number.EPSILON) {
            const ab = this.P0.lerp(this.P1, t0);
            const bc = this.P1.lerp(this.P2, t0);
            const cd = this.P2.lerp(this.P3, t0);
            const abc = ab.lerp(bc, t0);
            const bcd = bc.lerp(cd, t0);
            const abcd = abc.lerp(bcd, t0);
            return new CubicCurve(abcd, bcd, cd, this.P3);
        }
        const ab0 = this.P0.lerp(this.P1, t1);
        const bc0 = this.P1.lerp(this.P2, t1);
        const cd0 = this.P2.lerp(this.P3, t1);
        const abc0 = ab0.lerp(bc0, t1);
        const bcd0 = bc0.lerp(cd0, t1);
        const abcd0 = abc0.lerp(bcd0, t1);
        const m = t0 / t1;
        const ab1 = this.P0.lerp(ab0, m);
        const bc1 = ab0.lerp(abc0, m);
        const cd1 = abc0.lerp(abcd0, m);
        const abc1 = ab1.lerp(bc1, m);
        const bcd1 = bc1.lerp(cd1, m);
        const abcd1 = abc1.lerp(bcd1, m);
        return new CubicCurve(abcd1, bcd1, cd1, abcd0);
    }
    findMaxCurvature() {
        const axx = this.P1.X - this.P0.X;
        const bxx = this.P2.X - 2.0 * this.P1.X + this.P0.X;
        const cxx = this.P3.X + 3.0 * (this.P1.X - this.P2.X) - this.P0.X;
        const cox0 = cxx * cxx;
        const cox1 = 3.0 * bxx * cxx;
        const cox2 = 2.0 * bxx * bxx + cxx * axx;
        const cox3 = axx * bxx;
        const ayy = this.P1.Y - this.P0.Y;
        const byy = this.P2.Y - 2.0 * this.P1.Y + this.P0.Y;
        const cyy = this.P3.Y + 3.0 * (this.P1.Y - this.P2.Y) - this.P0.Y;
        const coy0 = cyy * cyy;
        const coy1 = 3.0 * byy * cyy;
        const coy2 = 2.0 * byy * byy + cyy * ayy;
        const coy3 = ayy * byy;
        const coe0 = cox0 + coy0;
        const coe1 = cox1 + coy1;
        const coe2 = cox2 + coy2;
        const coe3 = cox3 + coy3;
        return findCubicRoots(coe0, coe1, coe2, coe3);
    }
    findInflections() {
        const ax = this.P1.X - this.P0.X;
        const ay = this.P1.Y - this.P0.Y;
        const bx = this.P2.X - 2.0 * this.P1.X + this.P0.X;
        const by = this.P2.Y - 2.0 * this.P1.Y + this.P0.Y;
        const cx = this.P3.X + 3.0 * (this.P1.X - this.P2.X) - this.P0.X;
        const cy = this.P3.Y + 3.0 * (this.P1.Y - this.P2.Y) - this.P0.Y;
        return findQuadraticRoots(
            bx * cy - by * cx,
            ax * cy - ay * cx,
            ax * by - ay * bx,
        );
    }
    split() {
        const c = this.P1.plus(this.P2).multiplyScalar(0.5);
        const aP2 = this.P0.plus(this.P1).multiplyScalar(0.5);
        const bP3 = this.P2.plus(this.P3).multiplyScalar(0.5);
        const aP3 = aP2.plus(c).multiplyScalar(0.5);
        const bP2 = bP3.plus(c).multiplyScalar(0.5);
        const m = aP3.plus(bP2).multiplyScalar(0.5);
        return [
            new CubicCurve(this.P0, aP2, aP3, m),
            new CubicCurve(m, bP2, bP3, this.P3),
        ];
    }
    findRayIntersections(linePointA, linePointB) {
        const v = linePointB.minus(linePointA);
        const ax =
            (this.P0.Y - linePointA.Y) * v.X - (this.P0.X - linePointA.X) * v.Y;
        const bx =
            (this.P1.Y - linePointA.Y) * v.X - (this.P1.X - linePointA.X) * v.Y;
        const cx =
            (this.P2.Y - linePointA.Y) * v.X - (this.P2.X - linePointA.X) * v.Y;
        const dx =
            (this.P3.Y - linePointA.Y) * v.X - (this.P3.X - linePointA.X) * v.Y;
        const a = dx;
        const b = cx * 3;
        const c = bx * 3;
        const D = ax;
        const A = a - (D - c + b);
        const B = b + (3 * D - 2 * c);
        const C = c - 3 * D;
        return findCubicRoots(A, B, C, D);
    }
}
export class CubicCurveBuilder {
    segments = [];
    addLine(p0, p1) {
        this.segments.push(CubicCurve.createFromLine(p0, p1));
    }
    addCubic(p0, cp1, cp2, to) {
        this.segments.push(new CubicCurve(p0, cp1, cp2, to));
    }
    getFirstPoint() {
        return this.segments[0].P0;
    }
    getLastPoint() {
        return this.segments[this.segments.length - 1].P3;
    }
    getStartTangent() {
        return this.segments[0].startTangent();
    }
    getEndTangent() {
        return this.segments[this.segments.length - 1].endTangent();
    }
    getSegmentCount() {
        return this.segments.length;
    }
    getSegmentAt(index) {
        return this.segments[index];
    }
    reset() {
        this.segments.length = 0;
    }
}
class OutputBuilder {
    builder = new CubicCurveBuilder();
    previousPoint = FloatPoint.zero;
    previousPointT = FloatPoint.zero;
    cuspPoint = FloatPoint.zero;
    needsCuspArc = false;
    cuspArcClockwise = false;
    scale = 1;
    translation = FloatPoint.zero;
    constructor(builder, scale, translation) {
        this.builder = builder;
        this.scale = scale;
        this.translation = translation;
    }
}
function moveTo(builder, to) {
    builder.previousPoint = to;
    builder.previousPointT = to
        .multiplyScalar(builder.scale)
        .plus(builder.translation);
}
function lineTo(builder, to) {
    const previous = builder.previousPoint;
    if (!previous.equals(to)) {
        const t = to.multiplyScalar(builder.scale).plus(builder.translation);
        builder.builder.addLine(builder.previousPointT, t);
        builder.previousPoint = to;
        builder.previousPointT = t;
    }
}
function cubicTo(builder, cp1, cp2, to) {
    const previous = builder.previousPoint;
    if (
        !previous.equals(cp1) ||
        !previous.equals(cp2) ||
        !previous.equals(to)
    ) {
        const c1 = cp1.multiplyScalar(builder.scale).plus(builder.translation);
        const c2 = cp2.multiplyScalar(builder.scale).plus(builder.translation);
        const t = to.multiplyScalar(builder.scale).plus(builder.translation);
        builder.builder.addCubic(builder.previousPointT, c1, c2, t);
        builder.previousPoint = to;
        builder.previousPointT = t;
    }
}
function findUnitCubicCurveForArc(p0, p3) {
    const ax = p0.X;
    const ay = p0.Y;
    const bx = p3.X;
    const by = p3.Y;
    const q1 = ax * ax + ay * ay;
    const q2 = q1 + ax * bx + ay * by;
    const k2 =
        ((4.0 / 3.0) * (Math.sqrt(2.0 * q1 * q2) - q2)) / (ax * by - ay * bx);
    const x1 = p0.X - k2 * p0.Y;
    const y1 = p0.Y + k2 * p0.X;
    const x2 = p3.X + k2 * p3.Y;
    const y2 = p3.Y - k2 * p3.X;
    return new CubicCurve(
        p0,
        new FloatPoint(x1, y1),
        new FloatPoint(x2, y2),
        p3,
    );
}
function arcTo(builder, center, to, clockwise) {
    const arcFrom = builder.previousPoint;
    const arcRadius = center.distanceTo(arcFrom);
    if (arcRadius < MinimumArcRadius) {
        return;
    }
    const centerToCurrentPoint = new FloatLine(center, arcFrom);
    const centerToEndPoint = new FloatLine(center, to);
    const startAngle = deg2Rad(centerToCurrentPoint.angle());
    let sweepAngle = centerToCurrentPoint.getRadiansToLine(centerToEndPoint);
    if (fuzzyIsZero(sweepAngle)) {
        return;
    }
    const determinedOrientation = FloatPoint.determineTriangleOrientation(
        center,
        arcFrom,
        to,
    );
    if (determinedOrientation !== TrianglePointOrientationCollinear) {
        const determinedClockwise =
            determinedOrientation === TrianglePointOrientationClockwise;
        if (determinedClockwise != clockwise) {
            sweepAngle = Math.PI * 2.0 - sweepAngle;
        }
    }
    const nSteps = Math.ceil(sweepAngle / (Math.PI / 2.0));
    const step = (sweepAngle / nSteps) * (clockwise ? -1.0 : 1.0);
    let s = -Math.sin(startAngle);
    let c = Math.cos(startAngle);
    for (let i = 1; i <= nSteps; i++) {
        const a1 = startAngle + step * i;
        const s1 = -Math.sin(a1);
        const c1 = Math.cos(a1);
        const unitCurve = findUnitCubicCurveForArc(
            new FloatPoint(c, s),
            new FloatPoint(c1, s1),
        );
        const p1 = unitCurve.P1.multiplyScalar(arcRadius).plus(center);
        const p2 = unitCurve.P2.multiplyScalar(arcRadius).plus(center);
        if (i < nSteps) {
            const p3 = unitCurve.P3.multiplyScalar(arcRadius).plus(center);
            cubicTo(builder, p1, p2, p3);
        } else {
            cubicTo(builder, p1, p2, to);
        }
        s = s1;
        c = c1;
    }
}
function maybeAddCuspArc(builder, toPoint) {
    if (builder.needsCuspArc) {
        builder.needsCuspArc = false;
        arcTo(builder, builder.cuspPoint, toPoint, builder.cuspArcClockwise);
        builder.cuspPoint = FloatPoint.zero;
        builder.cuspArcClockwise = false;
    }
}
function acceptOffset(original, parallel, offset, maximumError) {
    if (
        FloatPoint.isTriangleClockwise(original.P0, original.P1, original.P3) !=
        FloatPoint.isTriangleClockwise(parallel.P0, parallel.P1, parallel.P3)
    ) {
        return false;
    }
    if (
        FloatPoint.isTriangleClockwise(original.P0, original.P2, original.P3) !=
        FloatPoint.isTriangleClockwise(parallel.P0, parallel.P2, parallel.P3)
    ) {
        return false;
    }
    for (let i = 0; i < SimpleOffsetProbePositions.length; i++) {
        const t = SimpleOffsetProbePositions[i];
        const op0 = original.pointAt(t);
        const n = original.normalVector(t);
        const roots = parallel.findRayIntersections(op0, op0.plus(n));
        if (roots.length != 1) {
            return false;
        }
        const p0 = parallel.pointAt(roots[0]);
        const d = op0.distanceTo(p0);
        const error = Math.abs(d - Math.abs(offset));
        if (error > maximumError) {
            return false;
        }
    }
    return true;
}
function arcOffset(builder, offset, center, from, to, clockwise) {
    let l1 = new FloatLine(center, from);
    let l2 = new FloatLine(center, to);
    if (clockwise) {
        l1.extendByLengthFront(offset);
        l2.extendByLengthFront(offset);
    } else {
        l1.extendByLengthFront(-offset);
        l2.extendByLengthFront(-offset);
    }
    maybeAddCuspArc(builder, l1.P1);
    arcTo(
        builder,
        center,
        l2.P1,
        FloatPoint.isTriangleClockwise(center, builder.previousPoint, l2.P1),
    );
}
function unitTurn(point1, point2, point3) {
    return point2
        .minus(point1)
        .unitVector()
        .cross(point3.minus(point1).unitVector());
}
class CurveTangentData {
    startTangent = FloatLine.zero;
    endTangent = FloatLine.zero;
    turn1 = 0;
    turn2 = 0;
    startUnitNormal = FloatPoint.zero;
    endUnitNormal = FloatPoint.zero;
    constructor(curve) {
        this.startTangent = curve.startTangent();
        this.endTangent = curve.endTangent();
        this.turn1 = unitTurn(
            this.startTangent.P0,
            this.startTangent.P1,
            this.endTangent.P0,
        );
        this.turn2 = unitTurn(
            this.startTangent.P0,
            this.endTangent.P1,
            this.endTangent.P0,
        );
        this.startUnitNormal = this.startTangent.unitNormalVector();
        this.endUnitNormal = this.endTangent.unitNormalVector();
    }
}
function canTryArcOffset(d) {
    const P = ApproximatelyStraightCurveTestApsilon;
    const N = -P;
    return (d.turn1 >= P && d.turn2 >= P) || (d.turn1 <= N && d.turn2 <= N);
}
function canTrySimpleOffset(d) {
    return (d.turn1 >= 0 && d.turn2 >= 0) || (d.turn1 <= 0 && d.turn2 <= 0);
}
function curveIsTooTiny(curve) {
    const lengthsSquared =
        curve.P0.distanceToSquared(curve.P1) +
        curve.P1.distanceToSquared(curve.P2) +
        curve.P2.distanceToSquared(curve.P3);
    return lengthsSquared <= MaximumTinyCurvePolygonPerimeterSquared;
}
function trySimpleCurveOffset(curve, d, builder, offset, maximumError) {
    if (!canTrySimpleOffset(d)) {
        return false;
    }
    const d1 = curve.P1.minus(curve.P0);
    const d2 = curve.P2.minus(curve.P3);
    const div = d1.cross(d2);
    if (fuzzyIsZero(div)) {
        return false;
    }
    const p0 = d.startTangent.P0.plus(
        d.startTangent.unitNormalVector().multiplyScalar(offset),
    );
    const p3 = d.endTangent.P0.minus(
        d.endTangent.unitNormalVector().multiplyScalar(offset),
    );
    const mp = curve.pointAt(0.5);
    const mpN = curve.unitNormalVector(0.5);
    const p = mp.plus(mpN.multiplyScalar(offset));
    const bxby = p
        .minus(p0.plus(p3).multiplyScalar(0.5))
        .multiplyScalar(8.0 / 3.0);
    const a = bxby.cross(d2) / div;
    const b = d1.cross(bxby) / div;
    const p1 = new FloatPoint(p0.X + a * d1.X, p0.Y + a * d1.Y);
    const p2 = new FloatPoint(p3.X + b * d2.X, p3.Y + b * d2.Y);
    const candidate = new CubicCurve(p0, p1, p2, p3);
    if (curveIsTooTiny(candidate)) {
        return true;
    }
    if (!acceptOffset(curve, candidate, offset, maximumError)) {
        return false;
    }
    maybeAddCuspArc(builder, candidate.P0);
    cubicTo(builder, candidate.P1, candidate.P2, candidate.P3);
    return true;
}
function arrayContainsCurvePosition(array, value, epsilon) {
    for (let i = 0; i < array.length; i++) {
        const v = array[i];
        if (isEqualWithEpsilon(value, v, epsilon)) {
            return true;
        }
    }
    return false;
}
function mergeCurvePositions(array, na, epsilon) {
    const va = array.concat(na);
    let gx = [];
    for (let i = 0; i < va.length; i++) {
        const v = va[i];
        if (isZeroWithEpsilon(v, epsilon)) {
            continue;
        }
        if (isEqualWithEpsilon(v, 1.0, epsilon)) {
            continue;
        }
        if (arrayContainsCurvePosition(gx, v, epsilon)) {
            continue;
        }
        gx.push(v);
    }
    return gx;
}
function lineCircleIntersect(line, circleCenter, circleRadius) {
    const d = line.P1.minus(line.P0);
    const g = line.P0.minus(circleCenter);
    const a = d.dot(d);
    const b = 2.0 * g.dot(d);
    const crSquared = circleRadius * circleRadius;
    const c = g.dot(g) - crSquared;
    const discriminant = b * b - 4.0 * a * c;
    if (discriminant > 0) {
        const dsq = Math.sqrt(discriminant);
        const a2 = a * 2.0;
        const t1 = (-b - dsq) / a2;
        const t2 = (-b + dsq) / a2;
        return (t1 >= 0.0 && t1 <= 1.0) || (t2 >= 0.0 && t2 <= 1.0);
    }
    return false;
}
function goodArc(arcCenter, arcRadius, curve, maximumError, tFrom, tTo) {
    if (arcRadius > MaximumArcRadius) {
        return false;
    }
    const e = Math.min(maximumError, arcRadius / 3.0);
    const me = e * (0.5 + 1e-4);
    for (let i = 0; i < ArcProbePositions.length; i++) {
        const t = ArcProbePositions[i];
        const curveT = interpolateLinear(t, tFrom, tTo);
        const point = curve.pointAt(curveT);
        const n = curve.unitNormalVector(curveT);
        const segment = new FloatLine(
            point.plus(n.multiplyScalar(me)),
            point.minus(n.multiplyScalar(me)),
        );
        if (!lineCircleIntersect(segment, arcCenter, arcRadius)) {
            return false;
        }
    }
    return true;
}
function tryArcApproximation(curve, d, builder, offset, maximumError) {
    if (!canTryArcOffset(d)) {
        return false;
    }
    const vectorFrom = d.startTangent.unitVector();
    const vectorTo = d.endTangent.unitVector();
    const denom = vectorTo.X * vectorFrom.Y - vectorTo.Y * vectorFrom.X;
    if (fuzzyIsZero(denom)) {
        return false;
    }
    const asv = d.startTangent.P0;
    const bsv = d.endTangent.P0;
    const u =
        ((bsv.Y - asv.Y) * vectorTo.X - (bsv.X - asv.X) * vectorTo.Y) / denom;
    const v =
        ((bsv.Y - asv.Y) * vectorFrom.X - (bsv.X - asv.X) * vectorFrom.Y) /
        denom;
    if (u < 0.0 || v < 0.0) {
        return false;
    }
    const V = asv.plus(vectorFrom.multiplyScalar(u));
    if (
        curve.P0.distanceToSquared(V) < d.startTangent.lengthSquared() * 0.25 ||
        curve.P3.distanceToSquared(V) < d.endTangent.lengthSquared() * 0.25
    ) {
        return false;
    }
    const P3VDistance = curve.P3.distanceTo(V);
    const P0VDistance = curve.P0.distanceTo(V);
    const P0P3Distance = curve.P0.distanceTo(curve.P3);
    const G = curve.P0.multiplyScalar(P3VDistance)
        .plus(
            curve.P3.multiplyScalar(P0VDistance).plus(
                V.multiplyScalar(P0P3Distance),
            ),
        )
        .divideScalar(P3VDistance + P0VDistance + P0P3Distance);
    const P0G = new FloatLine(curve.P0, G);
    const GP3 = new FloatLine(G, curve.P3);
    const E = new FloatLine(
        P0G.midPoint(),
        P0G.midPoint().minus(P0G.normalVector()),
    );
    const E1 = new FloatLine(
        d.startTangent.P0,
        d.startTangent.P0.minus(d.startTangent.normalVector()),
    );
    const C1 = E.intersectSimple(E1);
    if (C1 == null) {
        return false;
    }
    const roots = curve.findRayIntersections(C1, G);
    if (roots.length != 1) {
        return false;
    }
    const tG = roots[0];
    const dist0 = G.distanceTo(curve.pointAt(tG));
    if (dist0 > maximumError) {
        return false;
    }
    const F = new FloatLine(
        GP3.midPoint(),
        GP3.midPoint().minus(GP3.normalVector()),
    );
    const F1 = new FloatLine(
        d.endTangent.P0,
        d.endTangent.P0.plus(d.endTangent.normalVector()),
    );
    const C2 = F.intersectSimple(F1);
    if (C2 == null) {
        return false;
    }
    if (C1.equalsWithEpsilon(C2, ArcCenterComparisonEpsilon)) {
        const radius = C1.distanceTo(curve.P0);
        if (goodArc(C1, radius, curve, maximumError, 0, 1)) {
            const clockwise = FloatPoint.isTriangleClockwise(
                curve.P0,
                V,
                curve.P3,
            );
            arcOffset(builder, offset, C1, curve.P0, curve.P3, clockwise);
            return true;
        }
    } else {
        const radius1 = C1.distanceTo(curve.P0);
        if (!goodArc(C1, radius1, curve, maximumError, 0, tG)) {
            return false;
        }
        const radius2 = C2.distanceTo(curve.P3);
        if (!goodArc(C2, radius2, curve, maximumError, tG, 1)) {
            return false;
        }
        const clockwise = FloatPoint.isTriangleClockwise(curve.P0, V, curve.P3);
        arcOffset(builder, offset, C1, curve.P0, G, clockwise);
        arcOffset(builder, offset, C2, G, curve.P3, clockwise);
        return true;
    }
    return false;
}
function isCurveApproximatelyStraight(d) {
    const minx = Math.min(d.startTangent.x0(), d.endTangent.x0());
    const miny = Math.min(d.startTangent.y0(), d.endTangent.y0());
    const maxx = Math.max(d.startTangent.x0(), d.endTangent.x0());
    const maxy = Math.max(d.startTangent.y0(), d.endTangent.y0());
    const x1 = d.startTangent.x1();
    const y1 = d.startTangent.y1();
    const x2 = d.endTangent.x1();
    const y2 = d.endTangent.y1();
    return (
        minx <= x1 &&
        miny <= y1 &&
        maxx >= x1 &&
        maxy >= y1 &&
        minx <= x2 &&
        miny <= y2 &&
        maxx >= x2 &&
        maxy >= y2 &&
        isZeroWithEpsilon(d.turn1, ApproximatelyStraightCurveTestApsilon) &&
        isZeroWithEpsilon(d.turn2, ApproximatelyStraightCurveTestApsilon)
    );
}
function curveIsCompletelyStraight(d) {
    return (
        isZeroWithEpsilon(d.turn1, CompletelyStraightCurveTestApsilon) &&
        isZeroWithEpsilon(d.turn2, CompletelyStraightCurveTestApsilon)
    );
}
function approximateBezier(curve, d, builder, offset, maximumError) {
    if (!curve.isPointWithEpsilon(CurvePointClumpTestEpsilon)) {
        if (isCurveApproximatelyStraight(d)) {
            if (curveIsCompletelyStraight(d)) {
                const line = new FloatLine(curve.P0, curve.P1);
                const normal = line.unitNormalVector();
                maybeAddCuspArc(
                    builder,
                    line.P0.plus(normal.multiplyScalar(offset)),
                );
                lineTo(builder, line.P1.plus(normal.multiplyScalar(offset)));
            } else {
                const p1o = d.startTangent.P0.plus(
                    d.startUnitNormal.multiplyScalar(offset),
                );
                const p2o = d.startTangent.P1.plus(
                    d.startUnitNormal.multiplyScalar(offset),
                );
                const p3o = d.endTangent.P1.minus(
                    d.endUnitNormal.multiplyScalar(offset),
                );
                const p4o = d.endTangent.P0.minus(
                    d.endUnitNormal.multiplyScalar(offset),
                );
                maybeAddCuspArc(builder, p1o);
                cubicTo(builder, p2o, p3o, p4o);
            }
        } else {
            if (
                !trySimpleCurveOffset(curve, d, builder, offset, maximumError)
            ) {
                if (
                    !tryArcApproximation(
                        curve,
                        d,
                        builder,
                        offset,
                        maximumError,
                    )
                ) {
                    const curves = curve.split();
                    for (let i = 0; i < curves.length; i++) {
                        const da = new CurveTangentData(curves[i]);
                        approximateBezier(
                            curves[i],
                            da,
                            builder,
                            offset,
                            maximumError,
                        );
                    }
                }
            }
        }
    }
}
function findPositionOnCurveWithLargeEnoughDerivative(
    curve,
    previousT,
    currentT,
) {
    const kPrecision = CuspDerivativeLengthSquared * 2.0;
    let t = Math.max(
        interpolateLinear(previousT, currentT, 0.8),
        currentT - 0.05,
    );
    for (let i = 0; i < NearCuspPointSearchMaxIterationCount; i++) {
        const derivative = curve.derivedAt(t);
        const lengthSquared = derivative.lengthSquared();
        if (lengthSquared < kPrecision) {
            return t;
        }
        const a = t + currentT;
        t = a / 2.0;
    }
    return t;
}
function findPositionOnCurveWithLargeEnoughDerivativeStart(
    curve,
    currentT,
    nextT,
) {
    const kPrecision = CuspDerivativeLengthSquared * 2.0;
    let t = Math.min(interpolateLinear(currentT, nextT, 0.2), currentT + 0.05);
    for (let i = 0; i < NearCuspPointSearchMaxIterationCount; i++) {
        const derivative = curve.derivedAt(t);
        const lengthSquared = derivative.lengthSquared();
        if (lengthSquared < kPrecision) {
            return t;
        }
        const a = currentT + t;
        t = a / 2.0;
    }
    return t;
}
function offsetLinearCuspyCurve(
    curve,
    builder,
    offset,
    maximumCurvaturePoints,
) {
    const startTangent = curve.startTangent();
    const normal = startTangent.unitNormalVector();
    let previousPoint = startTangent.P0;
    let previousOffsetPoint = previousPoint.plus(normal.multiplyScalar(offset));
    moveTo(builder, previousOffsetPoint);
    for (let i = 0; i < maximumCurvaturePoints.length; i++) {
        const t = maximumCurvaturePoints[i];
        const derived = curve.derivedAt(t);
        const lengthSquared = derived.lengthSquared();
        if (lengthSquared <= 1e-9) {
            const pointAtCusp = curve.pointAt(t);
            const l = new FloatLine(previousPoint, pointAtCusp);
            const n = l.unitNormalVector();
            const to = pointAtCusp.plus(n.multiplyScalar(offset));
            lineTo(builder, to);
            const aTo = pointAtCusp.minus(n.multiplyScalar(offset));
            arcTo(
                builder,
                pointAtCusp,
                aTo,
                FloatPoint.isTriangleClockwise(
                    previousPoint,
                    previousOffsetPoint,
                    pointAtCusp,
                ),
            );
            previousPoint = pointAtCusp;
            previousOffsetPoint = aTo;
        }
    }
    const endTangent = curve.endTangent();
    const normal2 = endTangent.unitNormalVector();
    lineTo(builder, endTangent.P0.minus(normal2.multiplyScalar(offset)));
}
function doApproximateBezier(curve, d, builder, offset, maximumError) {
    const maximumCurvaturePositions = curve.findMaxCurvature();
    if (curveIsCompletelyStraight(d)) {
        offsetLinearCuspyCurve(
            curve,
            builder,
            offset,
            maximumCurvaturePositions,
        );
        return;
    }
    const inflections = curve.findInflections();
    const t = mergeCurvePositions(maximumCurvaturePositions, inflections, 1e-5);
    t.sort();
    if (t.length == 0) {
        approximateBezier(curve, d, builder, offset, maximumError);
    } else {
        let previousT = 0;
        for (let i = 0; i < t.length; i++) {
            const T = t[i];
            const derivative = curve.derivedAt(T);
            const lengthSquared = derivative.lengthSquared();
            if (lengthSquared < CuspDerivativeLengthSquared) {
                const t1 = findPositionOnCurveWithLargeEnoughDerivative(
                    curve,
                    previousT,
                    T,
                );
                const k = curve.getSubcurve(previousT, t1);
                const nd = new CurveTangentData(k);
                approximateBezier(k, nd, builder, offset, maximumError);
                const t2 = findPositionOnCurveWithLargeEnoughDerivativeStart(
                    curve,
                    T,
                    i == t.length - 1 ? 1.0 : t[i + 1],
                );
                builder.cuspPoint = curve.pointAt(T);
                builder.needsCuspArc = true;
                builder.cuspArcClockwise = FloatPoint.isTriangleClockwise(
                    k.P3,
                    builder.cuspPoint,
                    curve.pointAt(t2),
                );
                previousT = t2;
            } else {
                const k = curve.getSubcurve(previousT, T);
                const nd = new CurveTangentData(k);
                approximateBezier(k, nd, builder, offset, maximumError);
                previousT = T;
            }
        }
        const k = curve.getSubcurve(previousT, 1.0);
        const nd = new CurveTangentData(k);
        approximateBezier(k, nd, builder, offset, maximumError);
    }
}
function fixRedundantTangents(curve) {
    let p1 = curve.P1;
    let p2 = curve.P2;
    if (curve.P0.distanceToSquared(p1) < 1e-12) {
        p1 = curve.P0;
    }
    if (curve.P3.distanceToSquared(p2) < 1e-12) {
        p2 = curve.P3;
    }
    return new CubicCurve(curve.P0, p1, p2, curve.P3);
}
export function offsetCurve(curve, offset, maximumError, builder) {
    builder.reset();
    const minx = min4(curve.P0.X, curve.P1.X, curve.P2.X, curve.P3.X);
    const maxx = max4(curve.P0.X, curve.P1.X, curve.P2.X, curve.P3.X);
    const miny = min4(curve.P0.Y, curve.P1.Y, curve.P2.Y, curve.P3.Y);
    const maxy = max4(curve.P0.Y, curve.P1.Y, curve.P2.Y, curve.P3.Y);
    const dx = maxx - minx;
    const dy = maxy - miny;
    if (dx < CurvePointClumpTestEpsilon && dy < CurvePointClumpTestEpsilon) {
        return;
    }
    const m = Math.max(dx, dy) / 2.0;
    const so = offset / m;
    if (fuzzyIsZero(so)) {
        builder.addCubic(curve.P0, curve.P1, curve.P2, curve.P3);
        return;
    }
    const tx = (minx + maxx) / 2.0;
    const ty = (miny + maxy) / 2.0;
    const t = new FloatPoint(tx, ty);
    const p0 = curve.P0.minus(t);
    const p1 = curve.P1.minus(t);
    const p2 = curve.P2.minus(t);
    const p3 = curve.P3.minus(t);
    const sc = new CubicCurve(
        p0.divideScalar(m),
        p1.divideScalar(m),
        p2.divideScalar(m),
        p3.divideScalar(m),
    );
    const c = fixRedundantTangents(sc);
    let b = new OutputBuilder(builder, m, t);
    const d = new CurveTangentData(c);
    if (isCurveApproximatelyStraight(d)) {
        if (curveIsCompletelyStraight(d)) {
            const line = new FloatLine(c.P0, c.P3);
            const normal = line.unitNormalVector();
            const translated = line.translated(normal.multiplyScalar(so));
            moveTo(b, translated.P0);
            lineTo(b, translated.P1);
        } else {
            const p1o = d.startTangent.P0.plus(
                d.startUnitNormal.multiplyScalar(so),
            );
            const p2o = d.startTangent.P1.plus(
                d.startUnitNormal.multiplyScalar(so),
            );
            const p3o = d.endTangent.P1.minus(
                d.endUnitNormal.multiplyScalar(so),
            );
            const p4o = d.endTangent.P0.minus(
                d.endUnitNormal.multiplyScalar(so),
            );
            moveTo(b, p1o);
            cubicTo(b, p2o, p3o, p4o);
        }
    } else {
        moveTo(b, d.startTangent.P0.plus(d.startUnitNormal.multiplyScalar(so)));
        if (!tryArcApproximation(c, d, b, so, maximumError)) {
            doApproximateBezier(c, d, b, so, maximumError);
        }
    }
}