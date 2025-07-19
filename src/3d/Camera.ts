
export class PerspectiveCamera {
    private fov: number;
    private aspect: number;
    private near: number;
    private far: number;
    constructor(fov: number, aspect: number, near: number, far: number) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }
}