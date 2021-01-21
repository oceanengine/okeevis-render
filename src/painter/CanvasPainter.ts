import Painter from '../abstract/Painter';
import Render from '../render';
import Element, { defaultCanvasContext, FillAndStrokeStyle, } from '../shapes/Element';
import Shape, { ShapeConf } from '../shapes/Shape';
import Group, { GroupConf } from '../shapes/Group';
import Rect from '../shapes/Rect';
import Text from '../shapes/Text';
import { BBox, bboxIntersect } from '../utils/bbox';
import { mergeDirtyRect } from './dirtyRect';
import { getCtxColor, isGradient, isTransparent, ColorValue, } from '../color';
import { IDENTRY_MATRIX } from '../constant';

const contextKeys: Array<keyof ShapeConf> = [
  'fill',
  'fontSize',
  'blendMode',
  'lineCap',
  'fillOpacity',
  'strokeOpacity',
  'lineDashOffset',
  'lineJoin',
  'lineWidth',
  'miterLimit',
  'shadowBlur',
  'shadowColor',
  'shadowOffsetX',
  'shadowOffsetY',
  'stroke',
  'textAlign',
  'textBaseline',
  'lineDash',
  'clip',
];
const fpsRect = new Rect({
  x: 0,
  y: 0,
  width: 88,
  height: 40,
  fill: '#000',
});
const fpsText = new Text({
  x: 8,
  y: 6,
  fill: '#fff',
  fontSize: 24,
  fontWeight: 'bold',
  textBaseline: 'top',
});

const renderingContext:FillAndStrokeStyle = {
  opacity: null,
  fill: null,
  stroke: null,
  fillOpacity: null,
  strokeOpacity: null,
  lineWidth: null,
  hasFill: null,
  hasStroke: null,
  needFill: null,
  needStroke: null,
};

export default class CanvasPainter implements Painter {
  public render: Render;

  public dpr: number;

  private _canvas: HTMLCanvasElement;

  private _canvasByCreated: boolean;

  private _ctx: CanvasRenderingContext2D;

  private _isPixelPainter: boolean = false;

  // 首帧强制走全屏刷新逻辑
  private _isFirstFrame: boolean = true;

  private _paintPosition: [number, number];

  private _frameTimes: number[] = [];

  public constructor(render: Render, isPixelPainter: boolean = false) {
    this.render = render;
    this._isPixelPainter = isPixelPainter;
    this.dpr = isPixelPainter ? 1 : render.dpr;
    isPixelPainter ? this._initPixelCanvas() : this._initCanvas();
    if (this.render.isBrowser() && !isPixelPainter) {
      // 浏览器窗口切换时, 脏矩形有点问题
      document.addEventListener('visibilitychange', this._handleDocumentVisibilityChange);
    }
  }

  public resize(width: number, height: number) {
    this._canvas.width = width * this.dpr;
    this._canvas.height = height * this.dpr;
    if (this.render.isBrowser()) {
      this._canvas.style.width = width + 'px';
      this._canvas.style.height = height + 'px';
    }
    this.render.dirty();
  }

  public onFrame(now?: number) {
    const showFPS = this.render.showFPS;
    const needUpdate = this.render.needUpdate();
    if (showFPS && now) {
      this._frameTimes.push(now);
      if (this._frameTimes.length > 60) {
        this._frameTimes.shift();
      }
    }

    const maxDirtyRects = this.render.maxDirtyRects;
    const dirtyElements = this.render.getDirtyElements();
    const dirytCount = dirtyElements.size;
    const allChunks = this.render.getAllChunks();
    if (needUpdate) {
      if (
        !this._isFirstFrame &&
        this.render.enableDirtyRect &&
        dirytCount > 0 &&
        dirytCount < maxDirtyRects
      ) {
        this.paintInDirtyRegion();
      } else {
        // 全屏刷新
        this.paint();
      }
    }
    if (allChunks.length > 0 && !this._isPixelPainter) {
      const { parent, chunks } = allChunks[0];
      this.paintChunk(parent, chunks[0]);
    }
    this._isFirstFrame = false;
    showFPS && this._drawFPS();
  }

  public getImageData(x: number, y: number, width: number, height: number): ImageData {
    return this._canvas.getContext('2d').getImageData(x, y, width, height);
  }

  public getContext(): CanvasRenderingContext2D {
    return this._ctx;
  }

  public paintAt(x: number, y: number) {
    this._paintPosition = [x, y];
    const ctx = this._canvas.getContext('2d');
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    const dpr = this.dpr;
    ctx.save();
    if (dpr !== 1) {
      ctx.scale(dpr, dpr);
    }
    ctx.translate(-x, -y);
    ctx.lineJoin = defaultCanvasContext.lineJoin;

    this.render.getRoot().eachChild(item => this.drawElement(ctx, item));
    ctx.restore();
  }

  public paintInDirtyRegion() {
    // console.time('compute dirty rects');
    const dirtyElements: Element[] = [];
    let dirtyRegions: BBox[] = [];
    this.render.getDirtyElements().forEach(el => dirtyElements.push(el));
    for (let i = 0; i < dirtyElements.length; i++) {
      const el = dirtyElements[i];
      dirtyRegions = mergeDirtyRect(dirtyRegions, el.getDirtyRects());
      // todo 检测脏区面积占比, 提前return
    }
    this.paint(dirtyRegions);
    // console.timeEnd('compute dirty rects');
  }

  public paintChunk(parent: Group, chunk: Element[]) {
    parent.mountChunk(chunk);
    chunk.forEach(item => item.clearDirty());
    const parentList: Element[] = [];
    let node = parent;
    while (node) {
      parentList.push(node);
      if (!node.attr.display) {
        return;
      }
      node = node.parentNode;
    }
    const ctx = this._ctx;
    const dpr = this.dpr;
    ctx.save();
    if (dpr !== 1) {
      ctx.scale(dpr, dpr);
    }
    ctx.font = `sans-serif ${defaultCanvasContext.fontSize}px`;
    ctx.textBaseline = defaultCanvasContext.textBaseline;
    ctx.lineJoin = defaultCanvasContext.lineJoin;
    parentList.forEach(current => this._setElementCanvasContext(ctx, current));
    chunk.forEach(item => this.drawElement(ctx, item));
    ctx.restore();
  }

  public paint(dirtyRegions?: BBox[]) {
    // console.time('paint');
    const ctx = this._canvas.getContext('2d');
    const dpr = this.dpr;
    if (!dirtyRegions) {
      ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    } else {
      dirtyRegions.forEach(region =>
        ctx.clearRect(region.x * dpr, region.y * dpr, region.width * dpr, region.height * dpr),
      );
    }
    ctx.save();
    if (dpr !== 1) {
      ctx.scale(dpr, dpr);
    }
    // 改变默认的canvas上下文
    ctx.font = `sans-serif ${defaultCanvasContext.fontSize}px`;
    ctx.textBaseline = defaultCanvasContext.textBaseline;
    ctx.lineJoin = defaultCanvasContext.lineJoin;
    // todo 初始化LineWidth = 0;

    if (dirtyRegions) {
      ctx.beginPath();
      dirtyRegions.forEach(region => this._brushRect(ctx, region));
      ctx.clip();
    }
    this.render.getRoot().eachChild(item => this.drawElement(ctx, item, dirtyRegions));
    ctx.restore();
    // console.timeEnd('paint');
  }

  public drawElement(ctx: CanvasRenderingContext2D, item: Element, dirtyRegions?: BBox[]) {
    item.clearDirty();

    if (!item.attr.display) {
      return;
    }

    if (this._isPixelPainter && !item.pickRGB && !item.isGroup) {
      return;
    }

    if (dirtyRegions) {
      const bbox = item.getCurrentDirtyRect();
      const isDirty = dirtyRegions.some(region => bboxIntersect(region, bbox));
      if (!isDirty) {
        return;
      }
    }
    item.getFillAndStrokeStyle(renderingContext);
    // if (isInBatch) {
    //   if (item.isGroup) {
    //     console.warn('batch brush muse be shape element');
    //     return;
    //   }
    //   const shape = item as Shape;
    //   shape.brush(ctx);
    //   return;
    // }

    if (renderingContext.opacity === 0 && !this._isPixelPainter) {
      return;
    }
    const hasSelfContext = this._isPixelPainter
      ? true
      : this._hasSelfContext(item);

    if (hasSelfContext) {
      ctx.save();
    }

    hasSelfContext && this._setElementCanvasContext(ctx, item);
    if (item.type !== 'group') {
      const current = item as Shape;
      if (item.fillAble && renderingContext.needFill && !this._isPixelPainter) {
        if (renderingContext.fillOpacity !== renderingContext.strokeOpacity) {
          ctx.globalAlpha = renderingContext.fillOpacity;
        }
      }
      if (item.fillAble || (item.strokeAble && item.type !== 'text')) {
        ctx.beginPath();
      }
      current.brush(ctx);
      if (
        item.fillAble &&
        (renderingContext.needFill || (this._isPixelPainter && renderingContext.hasFill)) &&
        item.type !== 'text'
      ) {
        ctx.fill();
      }
      if (item.strokeAble && renderingContext.needStroke && !this._isPixelPainter) {
        if (renderingContext.fillOpacity !== renderingContext.strokeOpacity) {
          ctx.globalAlpha = renderingContext.strokeOpacity;
        }
      }
      if (
        item.strokeAble &&
        (renderingContext.needStroke || (this._isPixelPainter && renderingContext.hasStroke)) &&
        item.type !== 'text'
      ) {
        ctx.stroke();
      }
    } else {
      const current = item as Group;
      // const batchBrush = current.attr._batchBrush;
      // if (batchBrush) {
      //   ctx.beginPath();
      // }
      
      current.eachChild(child => this.drawElement(ctx, child, dirtyRegions));
    
      // if (batchBrush) {
      //   if (fill && fill !== 'none') {
      //     ctx.fill();
      //   }
      //   if (stroke && stroke !== 'none') {
      //     ctx.stroke();
      //   }
      // }
    }

    if (!this._isPixelPainter && (this.render.showBBox || this.render.showBoundingRect)) {
      this._drawBBox(item);
    }

    if (hasSelfContext) {
      ctx.restore();
    }
  }

  public noDirtyRectNextFrame() {
    this._isFirstFrame = true;
  }

  public dispose() {
    if (this._canvasByCreated) {
      this._canvas.parentNode?.removeChild(this._canvas);
    }
    if (this.render.isBrowser()) {
      document.removeEventListener('visibilitychange', this._handleDocumentVisibilityChange);
    }
    this._canvas = null;
    this.render = null;
    this._ctx = null;
  }

  protected _initCanvas() {
    const render = this.render;
    const dom = render.getDom();
    const width = render.getWidth();
    const height = render.getHeight();
    // todo dpr
    const dpr = this.dpr;
    if (typeof (dom as HTMLCanvasElement).getContext === 'function') {
      this._canvas = dom as HTMLCanvasElement;
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      this._canvas = canvas;
      this._canvasByCreated = true;
      render.getDom().appendChild(canvas);
    }
    this._ctx = this._canvas.getContext('2d');
  }

  private _initPixelCanvas() {
    if (this.render.isBrowser()) {
      const canvas = document.createElement('canvas');
      // todo 考虑dpr < 1 (缩放的场景)
      const w = 1;
      const h = 1;
      canvas.width = w * this.render.dpr;
      canvas.height = h * this.render.dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      this._canvas = canvas;
      // document.body.appendChild(canvas);
      // canvas.style.cssText = 'margin: 20px;'
    } else {
      this._canvas = this.render.getDom() as HTMLCanvasElement;
    }
    this._ctx = this._canvas.getContext('2d');
  }

  protected _setElementCanvasContext(
    ctx: CanvasRenderingContext2D,
    item: Element<GroupConf>,
  ) {
    const {
      stroke,
      fill,
      fontSize,
      fontFamily,
      fontWeight,
      fontVariant,
      fontStyle,
      blendMode,
      lineCap,
      lineDashOffset,
      lineJoin,
      lineWidth,
      miterLimit,
      shadowBlur,
      shadowColor,
      shadowOffsetX,
      shadowOffsetY,
      textAlign,
      textBaseline,
      lineDash,
      clip,
    } = item.attr;

    const computedFill = item.getExtendAttr('fill');
    const computedStroke = item.getExtendAttr('stroke');
    const opacity = item.getComputedOpacity();
    const fillOpacity = item.getExtendAttr('fillOpacity') * opacity;
    const strokeOpacity = item.getExtendAttr('strokeOpacity') * opacity;

    const selfMatrix = item.getTransform();
    const baseMatrix = item.getBaseTransform();
    if (baseMatrix !== IDENTRY_MATRIX || selfMatrix !== IDENTRY_MATRIX) {
      if (baseMatrix !== IDENTRY_MATRIX) {
        const globalMatrix = item.getGlobalTransform();
        ctx.resetTransform();
        if (this.dpr !== 1) {
          ctx.scale(this.dpr, this.dpr);
        }
        if (this._isPixelPainter) {
          ctx.translate(-this._paintPosition[0], -this._paintPosition[1]);
        }
        ctx.transform(
          globalMatrix[0],
          globalMatrix[1],
          globalMatrix[3],
          globalMatrix[4],
          globalMatrix[6],
          globalMatrix[7],
        );
      } else if (selfMatrix !== IDENTRY_MATRIX) {
        ctx.transform(
          selfMatrix[0],
          selfMatrix[1],
          selfMatrix[3],
          selfMatrix[4],
          selfMatrix[6],
          selfMatrix[7],
        );
      }
    }

    if (clip) {
      const clipElement = item.getClipElement();
      ctx.beginPath();
      clipElement.brush(ctx);
      ctx.clip();
    }

    if (lineWidth >= 0) {
      ctx.lineWidth = !item.attr.strokeNoScale ? lineWidth : item.getExtendAttr('lineWidth');
    }

    if (lineCap) {
      ctx.lineCap = lineCap;
    }

    if (lineJoin) {
      ctx.lineJoin = lineJoin;
    }

    if (miterLimit >= 0) {
      ctx.miterLimit = miterLimit;
    }

    // 文本和图像自己检测, 不走gpu,不故考虑fontSize
    if (this._isPixelPainter && item.type !== 'group') {
      const rgb = item.pickRGB;
      const pickColor = `rgb(${rgb.join(',')})`;
      ctx.fillStyle = pickColor;
      ctx.strokeStyle = pickColor;
      return;
    }

    // group只支持color string, pattern,不支持渐变
    // todo 考虑小程序api setXXXX
    if (stroke && !(item.isGroup && isGradient(stroke))) {
      ctx.strokeStyle = getCtxColor(ctx, stroke, item);
    }

    if (!stroke && stroke !== 'none' && isGradient(computedStroke) && item.type !== 'group') {
      ctx.strokeStyle = getCtxColor(ctx, computedStroke, item);
    }

    /** 渐变样式无法继承 */
    if (fill && fill !== 'none' && !(item.isGroup && isGradient(fill))) {
      ctx.fillStyle = getCtxColor(ctx, fill, item);
    }

    /** 渐变样式无法继承 */
    if (!fill && isGradient(computedFill) && item.type !== 'group') {
      ctx.strokeStyle = getCtxColor(ctx, computedFill, item);
    }

    // todo 兼容小程序
    if (fontSize >= 0 || fontFamily || fontWeight || fontVariant || fontStyle) {
      const _fontSize = item.getExtendAttr('fontSize');
      const _fontFamily = item.getExtendAttr('fontFamily');
      const _fontWeight = item.getExtendAttr('fontWeight');
      const _fontStyle = item.getExtendAttr('fontStyle');
      ctx.font = `${_fontStyle} ${_fontWeight} ${_fontSize}px ${_fontFamily}`;
    }

    if (textBaseline) {
      ctx.textBaseline = textBaseline;
    }

    if (textAlign) {
      ctx.textAlign = textAlign;
    }

    // 透明度相同时不用复用alpha
    if (fillOpacity === strokeOpacity && fillOpacity !== 1) {
      ctx.globalAlpha = fillOpacity;
    }

    if (blendMode) {
      ctx.globalCompositeOperation = blendMode;
    }

    if (lineDashOffset !== undefined) {
      ctx.lineDashOffset = lineDashOffset;
    }

    if (shadowBlur > 0 && !isTransparent(shadowColor)) {
      ctx.shadowBlur = shadowBlur;
      ctx.shadowColor = shadowColor;
      ctx.shadowOffsetX = shadowOffsetX;
      ctx.shadowOffsetY = shadowOffsetY;
    }

    if (lineDash) {
      ctx.setLineDash(lineDash);
    }
  }

  protected _hasSelfContext(
    item: Element<ShapeConf>,
  ): boolean {

    if (contextKeys.some(key => item.attr[key] !== undefined)) {
      return true;
    }
    if (isGradient(renderingContext.fill) || isGradient(renderingContext.stroke)) {
      return true;
    }

    if (renderingContext.fillOpacity !== 1 || renderingContext.strokeOpacity !== 1) {
      return true;
    }

    if (item.getBaseTransform() !== IDENTRY_MATRIX || item.getTransform() !== IDENTRY_MATRIX) {
      return true;
    }

    return false;
  }

  private _drawBBox(item: Element) {
    if (this.render.showBBox) {
      this._brushBoundingBBox(item, false);
    }
    if (this.render.showBoundingRect) {
      this._brushBoundingBBox(item, true);
    }
  }

  private _brushBoundingBBox(item: Element, isClientBBox: boolean) {
    const ctx = this._ctx;
    const bbox = isClientBBox ? item.getClientBoundingRect() : item.getBBox();
    ctx.save();
    if (isClientBBox || item.isGroup) {
      ctx.resetTransform();
      ctx.scale(this.dpr, this.dpr);
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    this._brushRect(ctx, bbox);
    ctx.stroke();
    ctx.restore();
  }

  private _brushRect(ctx: CanvasRenderingContext2D, rect: BBox) {
    const { x, y, width, height } = rect;
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
  }

  private _handleDocumentVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // 在下一帧强制走全屏刷新逻辑
      this._isFirstFrame = true;
    }
  };

  private _drawFPS() {
    const frameTimes = this._frameTimes;
    const startTime = frameTimes[0];
    const endTime = frameTimes[frameTimes.length - 1];
    if (endTime === startTime) {
      return;
    }
    const fps = Math.floor((frameTimes.length * 1000) / (endTime - startTime));
    fpsText.setAttr({
      text: fps + ' fps'
    });
    this.drawElement(this._ctx, fpsRect);
    this.drawElement(this._ctx, fpsText);
  }
}
