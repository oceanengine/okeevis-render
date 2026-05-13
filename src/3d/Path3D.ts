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
        const path2d = new Path2D();

        const projectPoint = (x: number, y: number, z: number): [number, number] => {
            const m = mat4;
            const nx = m[0] * x + m[4] * y + m[8] * z + m[12];
            const ny = m[1] * x + m[5] * y + m[9] * z + m[13];
            const nw = m[3] * x + m[7] * y + m[11] * z + m[15];
            const w = Math.abs(nw) < 1e-8 ? 1 : nw;
            return [nx / w, ny / w];
        };

        this.commands.forEach(cmd => {
            const { action, params } = cmd;
            if (action === 'moveTo') {
                const [x, y, z] = params;
                const [px, py] = projectPoint(x, y, z);
                path2d.moveTo(px, py);
            } else if (action === 'lineTo') {
                const [x, y, z] = params;
                const [px, py] = projectPoint(x, y, z);
                path2d.lineTo(px, py);
            } else if (action === 'bezierCurveTo') {
                const [x1, y1, z1, x2, y2, z2, x, y, z] = params;
                const [p1x, p1y] = projectPoint(x1, y1, z1);
                const [p2x, p2y] = projectPoint(x2, y2, z2);
                const [p3x, p3y] = projectPoint(x, y, z);
                path2d.bezierCurveTo(p1x, p1y, p2x, p2y, p3x, p3y);
            } else if (action === 'closePath') {
                path2d.closePath();
            }
        });

        return path2d;
    }
}