import { Path3D } from "./Path3D";


export abstract class  Geometry {
    private _faces: Path3D[] = [];
    private _outlinePath: Path3D = new Path3D();
    
    public abstract getFaces(): Path3D[];

    public abstract buildOutline(ctx: Path3D): void;
}