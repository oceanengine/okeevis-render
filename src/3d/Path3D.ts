import Path2D from "../geometry/Path2D";

export interface Path3DCommand {
    action: 'moveTo' | 'lineTo' | 'bezierCurveTo' | 'closePath';
    params: number[];
}

export class Path3D {
    private commands: Path3DCommand[] = [];

    public moveTo(x: number, y: number, z: number = 0) {
        this.commands.push({
            action: 'moveTo',
            params: [x, y, z],
        });
    }

    public lineTo(x: number, y: number, z: number = 0) {
        this.commands.push({
            action: 'lineTo',
            params: [x, y, z],
        });
    } 

    public bezierCurveTo(x1: number, y1: number, z1: number,  x2: number, y2: number, z2: number,  x: number, y: number, z: number) {
        this.commands.push({
            action: 'bezierCurveTo',
            params: [x1, y1, z1, x2, y2, z2, x, y, z],
        });
    }

    public closePath() {
        this.commands.push({
            action: 'closePath',
            params: [],
        });
    }

    public projection(mat4: number[]): Path2D {
       return new Path2D();
    }
}