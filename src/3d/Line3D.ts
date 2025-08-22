import { Geometry } from "./Geometry";
import { Path3D } from "./Path3D";


export class Line3D extends Geometry {

    private params: number[];

    public constructor(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
        super();
        this.params = [x1, y1, z1, x2, y2, z2];
    }
    public getFaces(): Path3D[] {
        return [];
    }

    public buildOutline(ctx: Path3D) {
        ctx.moveTo(this.params[0], this.params[1], this.params[2]);
        ctx.lineTo(this.params[3], this.params[4], this.params[5]);
    }
}