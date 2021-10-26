import * as lodash from '../utils/lodash';
import parsePath from './parsePath';
import { BBox, rectBBox, arcBBox, polygonBBox } from '../utils/bbox';
import { equalWithTolerance, getPointOnPolar } from '../utils/math';
import canvasToSvgPath from './canvasToSvgPath';
import { getPathSegments, getSegmentLength, getPointAtSegment, SegmentPoint } from './pathSegment';

export type PointOnPath = SegmentPoint;

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

  public connectPath(path: Path2D) {
    const lastAction = this._pathList[this._pathList.length - 1];
    const pathList=  path.getPathList().slice();
    const firstAction = pathList[0];
    if (lastAction && firstAction) {
      const {x, y } = this.getActionEndPoint(lastAction);
      const [x1, y1] = firstAction.params;
      if (firstAction.action === 'moveTo' && equalWithTolerance(x, x1) && equalWithTolerance(y, y1)) {
        pathList.shift();
      }
    }
    this._pathList = this._pathList.concat(pathList);
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
      } else if (action === 'ellipse') {
        // todo ellipsis bbox
        const [cx, cy, rx, ry, ration, startAngle, endAngle] = params;
        this._pushBBoxPoints(points, arcBBox(cx, cy, rx, startAngle, endAngle));
      }
    }
    return polygonBBox(points);
  }

  private getActionEndPoint(pathAction: PathAction): {x: number; y: number} {
    let endX: number;
    let endY: number;
    const {action ,params} = pathAction;
    if (action === 'lineTo') {
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
    };
    return {
      x: endX,
      y: endY
    }
  }

  public getSVGPathString(): string {
    return canvasToSvgPath(this._pathList);
  }

  public getTotalLength(): number {
    const segments = getPathSegments(this, []);
    return lodash.sum(segments.map(item => getSegmentLength(item)));
  }

  public getPointAtLength(len: number): PointOnPath {
    const segments = getPathSegments(this, []);
    let sumLen = 0;
    for (let i = 0; i < segments.length; i++) {
      const segmentLength = getSegmentLength(segments[i]);
      if ((sumLen + segmentLength) >= len) {
        const sublen = len - sumLen;
        return getPointAtSegment(sublen / segmentLength , segments[i]);
      }
      sumLen += segmentLength;
    }
    return getPointAtSegment(0, segments[0]);
  }

  public getPointAtPercent(percent: number): PointOnPath {
    if (percent === 0 || percent === 1) {
      const segments = getPathSegments(this, []);
      if (percent === 0) {
        return getPointAtSegment(0, segments[0]);
      }
      if (percent === 1) {
        return getPointAtSegment(1, segments[segments.length -1]);
      }
    }
    const totalLen = this.getTotalLength();
    return this.getPointAtLength(totalLen * percent);
  }

  public clone(): Path2D {
    const path = new Path2D();
    const pathList = lodash.cloneDeep(this._pathList);
    path.setPathList(pathList);
    return path;
  }

  private _pushBBoxPoints(points: Point[], bbox: BBox) {
    const { x, y, width, height } = bbox;
    points.push({x,  y});
    points.push({x: x + width,  y});
    points.push({x: x + width,  y: y + height});
    points.push({x,  y: y + height});
  }
  
}
