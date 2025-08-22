import Element, {ElementAttr} from "../shapes/Element";
import { Geometry } from "./Geometry";

export interface Object3DAttr extends ElementAttr {
    
}

export class Object3D<T={}> extends Element<T & ElementAttr> {
    private _position: number[] = [0, 0, 0];
    private _rotation: number[] = [0, 0, 0];
    private _scale: number[] = [1, 1, 1];
    private _matrix: number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    private _geometry: Geometry;
    public get position() {
        return this._position;
    }
    public set position(value: number[]) {
        this._position = value;
    }

    public get scale() {
        return this._scale;
    }
    public set scale(value: number[]) {
        this._scale = value;
    }

    public get rotation() {
        return this._rotation;
    }
    public set rotation(value: number[]) {
        this._rotation = value;
    }

    public get matrix() {
        return this._matrix;
    }
}