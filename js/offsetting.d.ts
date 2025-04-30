export class FloatPoint {
    public X: number;
    public Y: number;
    constructor(x: number, y: number)
}
export class CubicCurveBuilder {
    public segments: CubicCurve[];
}
export class CubicCurve {
    public P0: FloatPoint;
    public P1: FloatPoint;
    public P2: FloatPoint;
    public P3: FloatPoint;
    constructor(point: FloatPoint, point2: FloatPoint, point3: FloatPoint, point4: FloatPoint);
}

export const offsetCurve: (curve: CubicCurve, d: number, accuracy: number, build: CubicCurveBuilder) => void;