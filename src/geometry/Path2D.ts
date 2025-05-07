import * as lodash from '../utils/lodash';
import parsePath from './parsePath';
import { BBox, rectBBox, arcBBox, polygonBBox } from '../utils/bbox';
import { equalWithTolerance, getPointOnPolar, getLeastCommonMultiple } from '../utils/math';
import canvasToSvgPath from './canvasToSvgPath';
import * as mat3 from '../../js/mat3';
import { transformMat3, Vec2 } from '../utils/vec2';
import {
  getPathSegments,
  Segment,
  getSegmentLength,
  getPointAtSegment,
  SegmentPoint,
  isPointInSegmentStroke,
} from './pathSegment';
import { pathToCurve, segmentToCurve } from './toCurve';
import { bezierSubDivision } from './bezierSubdivision';
import { bezierLineIntersection } from './intersection/bezier-line-intersection';
import { selfIntersection } from './intersection/self-intersection';
import { bezierIntersection } from './intersection/bezier-intersection';
import { segmentIntersection } from './intersection/segment-intersection';

export type PointOnPath = SegmentPoint;

interface Point {
  x: number;
  y: number;
}

export interface PathIntersection {
  x: number;
  y: number;
  winding: -1 | 1;
  t1: number;
  t2: number;
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
  rect: [[0, 1]],
  arc: [[0, 1]],
  ellipse: [[0, 1]],
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

  public static morphing(from: Path2D, to: Path2D): [Path2D, Path2D] {
    const fromCurve = from.toCurve();
    const toCurve = to.toCurve();
    const fromSubPathList = fromCurve.getSubpaths();
    const toSubPathList = toCurve.getSubpaths();
    const delta = fromSubPathList.length - toSubPathList.length;
    const min = Math.min(fromSubPathList.length, toSubPathList.length);
    const max = Math.max(fromSubPathList.length, toSubPathList.length);
    for (let i = min; i < max; i++) {
      const appendPath = (delta > 0 ? fromSubPathList[i] : toSubPathList[i]).clone();
      const { x, y, width, height } = appendPath.getPathBBox();
      appendPath.shrink(x + width / 2, y + height / 2);
      if (delta > 0) {
        toSubPathList.push(appendPath);
      } else {
        fromSubPathList.push(appendPath);
      }
    }
    for (let i = 0; i < max; i++) {
      const fromxx = fromSubPathList[i];
      const toxx = toSubPathList[i];
      const fromCount = fromxx.getPathList().filter(path => path.action === 'bezierCurveTo').length;
      const toCount = toxx.getPathList().filter(path => path.action === 'bezierCurveTo').length;
      const commonMultiple = getLeastCommonMultiple(fromCount, toCount);
      fromxx.subdivision(commonMultiple / fromCount);
      toxx.subdivision(commonMultiple / toCount);
    }

    const resFrom = new Path2D();
    const resTo = new Path2D();
    fromSubPathList.forEach(path => resFrom.addPath(path));
    toSubPathList.forEach(path => resTo.addPath(path));
    return [resFrom, resTo];
  }

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

  public getSubpaths(): Path2D[] {
    const commandList: PathAction[] = this.getPathList();
    const subPathList: Path2D[] = [];
    let curActions: PathAction[];
    let curPath: Path2D;
    for (const pathAction of commandList) {
      const { action } = pathAction;
      if (subPathList.length === 0 || action === 'moveTo') {
        curPath = new Path2D();
        curActions = [pathAction];
        curPath.setPathList(curActions);
        subPathList.push(curPath);
      } else {
        curActions.push(pathAction);
      }
    }
    return subPathList;
  }

  public isSimple() {
    const hasNextMoveTo = this._pathList.findIndex(command => command.action === 'moveTo') !== -1;
    if (hasNextMoveTo) {
      return false;
    }
    return this.isSelfIntersecting();
  }

  public isClosed(): boolean {
    // todo
    return false;
  }

  public getIntersections(path: Path2D): PathIntersection[] {
    const path1Segments = this.getSegments();
    const path2Segments = path.getSegments();
    const intersections: PathIntersection[] = [];
    path1Segments.forEach(segment1 => {
      path2Segments.forEach(segment2 => segmentIntersection(segment1, segment2, intersections));
    });
    return intersections;
  }

  public isSelfIntersecting() {
    const segments = this.getSegments();
    const curves: number[][] = [];
    segments.forEach(segment => segmentToCurve(segment, curves));
    for (let i = 0; i < curves.length; i++) {
      const curve1 = curves[i];
      if (
        segments[i].type === 'bezier' &&
        selfIntersection(
          curve1[0],
          curve1[1],
          curve1[2],
          curve1[3],
          curve1[4],
          curve1[5],
          curve1[6],
          curve1[7],
        ).length > 0
      ) {
        return true;
      }
      for (let j = i + 1; j < curves.length; j++) {
        const curve2 = curves[j];
        if (bezierIntersection(curve1, curve2).length > 0) {
          return true;
        }
      }
    }
  }

  public fillable() {
    // todo
    return false;
  }

  public getSimpleFillSegments(): Segment[]  {
    // todo
    return [];
  }

  // swapXY
  public reflect() {
    /**
     * @todo
     */
  }

  public connectPath(path: Path2D) {
    const lastAction = this._pathList[this._pathList.length - 1];
    const pathList = path.getPathList().slice();
    const firstAction = pathList[0];
    if (lastAction && firstAction) {
      const { x, y } = this.getActionEndPoint(lastAction);
      const [x1, y1] = firstAction.params;
      if (
        firstAction.action === 'moveTo' &&
        equalWithTolerance(x, x1) &&
        equalWithTolerance(y, y1)
      ) {
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

  public toCurve(): Path2D {
    return pathToCurve(this);
  }

  public reverse() {
    // todo;
  }

  public transform(a: number, b: number, c: number, d: number, e: number, f: number) {
    const matrix = mat3.fromValues(a, b, 1, c, d, 1, e, f, 1);
    this._pathList.forEach(path => {
      const { action, params } = path;
      if (PathKeyPoints[action]) {
        PathKeyPoints[action].forEach(xyIndex => {
          const [x, y] = xyIndex;
          const xy = [params[x], params[y]] as any as Vec2;
          transformMat3(xy, xy, matrix);
          params[x] = xy[0];
          params[y] = xy[1];
        });
      }
    });
  }

  public reset(): this {
    const bbox = this.getPathBBox();
    this.translate(-bbox.x, -bbox.y);
    return this;
  }

  public translate(dx: number, dy: number) {
    this.transform(1, 0, 0, 1, dx, dy);
  }

  public scale(sx: number, sy: number) {
    this.transform(sx, 0, 0, sy, 0, 0);
  }

  public addPath(path: Path2D) {
    this._pathList = this._pathList.concat(path.getPathList());
  }

  public shrink(cx: number, cy: number) {
    this._pathList.forEach(pathAction => {
      const { action, params } = pathAction;
      PathKeyPoints[action].forEach(item => {
        const [xIndex, yIndex] = item;
        params[xIndex] = cx;
        params[yIndex] = cy;
      });
    });
  }

  public rotate(theta: number) {
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    this.transform(cos, sin, -sin, cos, 0, 1);
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
    clockwise: boolean = true,
  ): this {
    this._pathList.push({
      action: 'ellipse',
      params: [x, y, radiusX, radiusY, rotation, start, end, clockwise],
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
          points.push({ x, y });
        });
      } else if (action === 'ellipse') {
        // todo ellipsis bbox
        // eslint-disable-next-line no-unused-vars
        const [cx, cy, rx, ry, ration, startAngle, endAngle] = params;
        this._pushBBoxPoints(points, arcBBox(cx, cy, rx, startAngle, endAngle));
      }
    }
    return polygonBBox(points);
  }

  private getActionEndPoint(pathAction: PathAction): { x: number; y: number } {
    let endX: number;
    let endY: number;
    const { action, params } = pathAction;
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
    }
    return {
      x: endX,
      y: endY,
    };
  }

  public getSVGPathString(): string {
    return canvasToSvgPath(this._pathList);
  }

  public getTotalLength(): number {
    const segments = getPathSegments(this, []);
    return lodash.sum(segments.map(item => getSegmentLength(item)));
  }

  public getSegments(): Segment[] {
    return getPathSegments(this, []);
  }

  public subdivision(count: number) {
    // 曲线细分 ,count是大于等于1的整数
    if (count % 1 !== 0) {
      throw new Error('细分必须是整数');
      return;
    }
    if (count <= 1) {
      return;
    }
    const newPathList: PathAction[] = [];
    let lastX: number;
    let lastY: number;
    this._pathList.forEach(path => {
      if (path.action === 'bezierCurveTo') {
        const subCurveList = bezierSubDivision([lastX, lastY, ...path.params], count);
        subCurveList.forEach(subcurveParams => {
          newPathList.push({
            action: 'bezierCurveTo',
            params: subcurveParams.slice(2),
          });
        });
        lastX = path.params[4];
        lastY = path.params[5];
      } else {
        // moveto;
        lastX = path.params[0];
        lastY = path.params[1];
        newPathList.push(path);
      }
    });
    this._pathList = newPathList;
  }

  public getPointAtLength(len: number): PointOnPath {
    const segments = this.getSegments();
    let sumLen = 0;
    for (let i = 0; i < segments.length; i++) {
      const segmentLength = getSegmentLength(segments[i]);
      if (sumLen + segmentLength >= len) {
        const sublen = len - sumLen;
        return getPointAtSegment(sublen / segmentLength, segments[i]);
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
        return getPointAtSegment(1, segments[segments.length - 1]);
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

  public stroke(options: {
    width: number;
    miterLimit: string;
    join: CanvasLineJoin;
    cap: CanvasLineCap;
    cornerRadius: number;
    align: 'inside' | 'outside' | 'center';
  }) {
    // todo
  }

  public isPointInPath(x: number, y: number, fillRule: 'nonzero' | 'evenodd' = 'nonzero'): boolean {
    const fillSegments = getPathSegments(this, [], 'fill');
    if (!fillSegments.length) {
      return false;
    }
    let windingNumber = 0; // 非零环绕
    let crossNumber = 0; // 奇偶环绕
    // 水平射线测试
    fillSegments.forEach(segment => {
      const curves = segmentToCurve(segment, []);
      curves.forEach(curve => {
        const [x1, y1, x2, y2, x3, y3, x4, y4] = curve;
        const maxX = Math.max(x1, x2, x3, x4);
        const intersections = bezierLineIntersection(
          x1,
          y1,
          x2,
          y2,
          x3,
          y3,
          x4,
          y4,
          x,
          y,
          maxX + 1,
          y,
        );
        intersections.forEach(intersection => {
          if (fillRule === 'nonzero') {
            windingNumber += intersection.winding;
          } else if (fillRule === 'evenodd') {
            crossNumber++;
          }
        });
      });
    });
    if (fillRule === 'nonzero') {
      return windingNumber !== 0;
    } else if (fillRule === 'evenodd') {
      return crossNumber % 2 === 1;
    }
    return false;
  }

  public isPointInStroke(x: number, y: number, strokeWidth: number): boolean {
    return this.getSegments().some(segment => isPointInSegmentStroke(segment, strokeWidth, x, y));
  }

  private _pushBBoxPoints(points: Point[], bbox: BBox) {
    const { x, y, width, height } = bbox;
    points.push({ x, y });
    points.push({ x: x + width, y });
    points.push({ x: x + width, y: y + height });
    points.push({ x, y: y + height });
  }
}
