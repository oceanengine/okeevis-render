import parsePath from './parsePath';
import { BBox, rectBBox, arcBBox, polygonBBox } from '../utils/bbox';
import { equalWithTolerance, getPointOnPolar } from '../utils/math';
import canvasToSvgPath from './canvasToSvgPath';

interface Point {
  x: number;
  y: number;
}

export interface PathAction {
  action:
    | 'moveTo'
    | 'lineTo'
    | 'arc'
    | 'arcTo'
    | 'bezierCurveTo'
    | 'quadraticCurveTo'
    | 'closePath'
    | 'ellipse'
    | 'rect'
    | 'drawImage'
    | 'fillText'
    | 'strokeText';
  params: any[];
}

const PathKeyPoints: Partial<Record<PathAction['action'], [number, number][]>> = {
  arcTo: [
    [0, 1],
    [2, 3],
  ],
  moveTo: [[0, 1]],
  lineTo: [[0, 1]],
  bezierCurveTo: [
    [0, 1],
    [2, 3],
    [4, 5],
  ],
  quadraticCurveTo: [
    [0, 1],
    [2, 3],
  ],
};

export default class Path2D {
  private _pathList: PathAction[] = [];

  public constructor(svgPath?: string) {
    if (svgPath) {
      this._pathList = parsePath(svgPath) as PathAction[];
    }
  }

  public setPathList(pathList: PathAction[]) {
    this._pathList = pathList;
  }

  public getPathList(): PathAction[] {
    return this._pathList;
  }

  public closePath(): this {
    this._pathList.push({
      action: 'closePath',
      params: [],
    });

    return this;
  }

  public moveTo(x: number, y: number): this {
    this._pathList.push({
      action: 'moveTo',
      params: [x, y],
    });

    return this;
  }

  public lineTo(x: number, y: number): this {
    const x2: number = x;
    const y2: number = y;
    this._pathList.push({
      action: 'lineTo',
      params: [x2, y2],
    });

    return this;
  }

  /**
   * 三次贝塞尔曲线
   */
  public bezierCurveTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
  ): this {
    this._pathList.push({
      action: 'bezierCurveTo',
      params: [x1, y1, x2, y2, x3, y3],
    });

    return this;
  }

  public quadraticCurveTo(x1: number, y1: number, x2: number, y2: number): this {
    this._pathList.push({
      action: 'quadraticCurveTo',
      params: [x1, y1, x2, y2],
    });

    return this;
  }

  public arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    anticlockwise: boolean = false,
  ): this {
    this._pathList.push({
      action: 'arc',
      params: [x, y, radius, startAngle, endAngle, anticlockwise],
    });

    return this;
  }

  public arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): this {
    this._pathList.push({
      action: 'arcTo',
      params: [x1, y1, x2, y2, radius],
    });

    return this;
  }

  public ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    start: number,
    end: number,
    closewise: boolean = true,
  ): this {
    this._pathList.push({
      action: 'ellipse',
      params: [x, y, radiusX, radiusY, rotation, start, end, closewise],
    });

    return this;
  }

  public rect(x: number, y: number, width: number, height: number): this {
    this._pathList.push({
      action: 'rect',
      params: [x, y, width, height],
    });

    return this;
  }

  public drawImage(
    image: HTMLImageElement,
    sX: number,
    sY: number,
    sWidth: number,
    sHeight: number,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const params = [image, sX, sY, sWidth, sHeight, x, y, width, height];
    this._pathList.push({
      action: 'drawImage',
      params,
    });
  }

  public fillText(text: string, x: number, y: number) {
    this._pathList.push({
      action: 'fillText',
      params: [text, x, y],
    });
  }

  public strokeText(text: string, x: number, y: number) {
    this._pathList.push({
      action: 'strokeText',
      params: [text, x, y],
    });
  }

  public drawOnCanvasContext(ctx: CanvasRenderingContext2D) {
    this._pathList.forEach(item => ctx[item.action].apply(ctx, item.params));
  }

  public getPathBBox(): BBox {
    const pathList = this._pathList;
    const points: Point[] = [];
    for (let i = 0; i < pathList.length; i++) {
      const { action, params } = pathList[i];
      if (action === 'arc') {
        const [cx, cy, r, startAngle, endAngle] = params;
        this._pushBBoxPoints(points, arcBBox(cx, cy, r, startAngle, endAngle));
      } else if (action === 'rect') {
        const [x, y, width, height] = params;
        this._pushBBoxPoints(points, rectBBox(x, y, width, height));
      } else if (
        action === 'moveTo' ||
        action === 'lineTo' ||
        action === 'bezierCurveTo' ||
        action === 'quadraticCurveTo' ||
        action === 'arcTo'
      ) {
        PathKeyPoints[action].forEach(item => {
          const [xIndex, yIndex] = item;
          const x = params[xIndex]; 
          const y = params[yIndex];
          points.push({x, y});
        });
      }
    }
    return polygonBBox(points);
  }

  public compressMoveToCommand() {
    let endX = 0;
    let endY = 0;
    let prevMoveToParam: [number, number];
    const mergeIndex: number[] = [];
    const pathList = this._pathList;
    for (let i = 0; i < pathList.length; i++) {
      const { action, params } = pathList[i];
      if (action === 'moveTo') {
        if (i !== 0) {
          if (equalWithTolerance(endX, params[0]) && equalWithTolerance(endY, params[1])) {
            mergeIndex.push(i);
          }
        }
        prevMoveToParam = params as [number, number];
      } else if (action === 'lineTo') {
        endX = params[0];
        endY = params[1];
      } else if (action === 'arcTo') {
        endX = params[2];
        endY = params[3];
      } else if (action === 'arc') {
        const [cx, cy, r, end] = params;
        const endPoint = getPointOnPolar(cx, cy, r, end);
        endX = endPoint.x;
        endY = endPoint.y;
      } else if (action === 'bezierCurveTo') {
        endX = params[4];
        endY = params[5];
      } else if (action === 'quadraticCurveTo') {
        endX = params[2];
        endY = params[3];
      } else if (action === 'closePath') {
        endX = prevMoveToParam[0];
        endY = prevMoveToParam[1];
      }
    }
    this._pathList = pathList.filter((path, index) => mergeIndex.indexOf(index) === -1);
  }

  public getSVGPathString(): string {
    return canvasToSvgPath(this._pathList);
  }

  public getTotalLength(): number {
    // todo
    return 0;
  }

  public getPointAtLength(len: number) {
    // todo
    return 0;
  }

  public getPointAtPercent(percent: number): [number, number] {
    // todo
    return [0, 0];
  }

  private _pushBBoxPoints(points: Point[], bbox: BBox) {
    const { x, y, width, height } = bbox;
    points.push({x,  y});
    points.push({x: x + width,  y});
    points.push({x: x + width,  y: y + height});
    points.push({x,  y: y + height});
  }
}
