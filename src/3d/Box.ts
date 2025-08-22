import { Geometry } from './Geometry';
import { Path3D } from './Path3D';

export class Box extends Geometry {
  private params: number[];

  public constructor(width: number, height: number, depth: number) {
    super();
    this.params = [width, height, depth];
  }
  public getFaces(): Path3D[] {
    const res: Path3D[] = [];
    const [width, height, depth] = this.params;
    const pathFront = new Path3D();
    const pathBack = new Path3D();
    const pathLeft = new Path3D();
    const pathRight = new Path3D();
    const pathTop = new Path3D();
    const pathBottom = new Path3D();
    pathFront.moveTo(0, 0, 0);
    pathFront.lineTo(width, 0, 0);
    pathFront.lineTo(width, height, 0);
    pathFront.lineTo(0, height, 0);
    pathFront.closePath();
    res.push(pathFront);
    pathBack.moveTo(0, 0, depth);
    pathBack.lineTo(width, 0, depth);
    pathBack.lineTo(width, height, depth);
    pathBack.lineTo(0, height, depth);
    pathBack.closePath();
    res.push(pathBack);
    pathLeft.moveTo(0, 0, 0);
    pathLeft.lineTo(0, 0, depth);
    pathLeft.lineTo(0, height, depth);
    pathLeft.lineTo(0, height, 0);
    pathLeft.closePath();
    res.push(pathLeft);
    pathRight.moveTo(width, 0, 0);
    pathRight.lineTo(width, 0, depth);
    pathRight.lineTo(width, height, depth);
    pathRight.lineTo(width, height, 0);
    pathRight.closePath();
    res.push(pathRight);
    pathTop.moveTo(0, height, 0);
    pathTop.lineTo(width, height, 0);
    pathTop.lineTo(width, height, depth);
    pathTop.lineTo(0, height, depth);
    pathTop.closePath();
    res.push(pathTop);
    pathBottom.moveTo(0, 0, 0);
    pathBottom.lineTo(width, 0, 0);
    pathBottom.lineTo(width, 0, depth);
    pathBottom.lineTo(0, 0, depth);
    pathBottom.closePath();
    res.push(pathBottom);
    return res;
  }

  public buildOutline(ctx: Path3D) {
    const [width, height, depth] = this.params;
    ctx.moveTo(0, 0, 0);
    ctx.lineTo(0, width, 0);
  }
}
