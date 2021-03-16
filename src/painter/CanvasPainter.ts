import Painter from '../abstract/Painter';
import { registerPainter } from './index';
import Render from '../render';
import Element, { defaultCanvasContext, } from '../shapes/Element';
import Shape, { ShapeConf } from '../shapes/Shape';
import Group, { GroupConf } from '../shapes/Group';
import { BBox, bboxIntersect, } from '../utils/bbox';
import mergeDirtyRegions from './dirtyRect';
import { getCtxColor, isGradient, isTransparent, ColorValue} from '../color';
import { IDENTRY_MATRIX } from '../constant';
import * as styleHelper from '../canvas/style';
import { getCanvasCreator } from '../canvas/createCanvas';
import { fpsRect, fpsText } from './fps';

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

  private _ctxCount = 0;

  private _repaintCount = 0;

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
    this._ctxCount = 0;
    this._repaintCount = 0;
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
    const chunk = this.render.getRoot().getOneChunk();
    if (needUpdate) {
      if (
        !this._isFirstFrame &&
        this.render.enableDirtyRect &&
        dirytCount > 0 &&
        dirytCount <= maxDirtyRects
      ) {
        this.paintInDirtyRegion();
      } else {
        // 全屏刷新
        this.paint();
      }
      // console.log('dirty-size: ', dirytCount)
      // console.log('ctx count: ', this._ctxCount)
      // console.log('paint count', this._repaintCount);
    }
    if (chunk && !this._isPixelPainter) {
      this.paintChunk(chunk.parent, chunk.items);
    }
    this._isFirstFrame = false;
    showFPS && this._drawFPS();
    if (this._ctx.draw) {
      this._ctx.draw(true);
    }
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
    if (this._canvas === this.render.getDom()) {
      ctx.clearRect(0, 0, 1, 1);
    } else {
      ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    const dpr = this.dpr;
    ctx.save();
    if (dpr !== 1 && this.render.scaleByDprBeforePaint) {
      ctx.scale(dpr, dpr);
    }
    if (this._canvas === this.render.getDom()) {
      ctx.beginPath();
      this._brushRect(ctx, { x: 0, y: 0, width: 1, height: 1 });
      ctx.clip();
    }
    ctx.translate(-x, -y);
    styleHelper.setLineJoin(ctx, defaultCanvasContext.lineJoin);

    this.render.getRoot().eachChild(item => this.drawElement(ctx, item));
    ctx.restore();
    if (ctx.draw) {
      ctx.draw(true);
    }
  }

  public paintInDirtyRegion() {
    // console.time('compute dirty rects');
    const dirtyElements: Element[] = [];
    let dirtyRegions: BBox[] = [];
    this.render.getDirtyElements().forEach(el => dirtyElements.push(el));
    for (let i = 0; i < dirtyElements.length; i++) {
      const el = dirtyElements[i];
      el.getDirtyRects().forEach(rect => dirtyRegions.push(rect));
    }
    const renderBbox = {x: 0, y: 0, width: this.render.getWidth(), height: this.render.getHeight()};
    dirtyRegions = dirtyRegions.filter(region => bboxIntersect(region, renderBbox));
    if (dirtyRegions.length === 0) {
      return;
    }
    this.paint(mergeDirtyRegions(dirtyRegions));
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
    if (dpr !== 1 && this.render.scaleByDprBeforePaint) {
      ctx.scale(dpr, dpr);
    }
    styleHelper.setFontStyle(ctx, defaultCanvasContext.fontSize, defaultCanvasContext.fontFamily);
    styleHelper.setTextBaseline(ctx, defaultCanvasContext.textBaseline);
    styleHelper.setLineJoin(ctx, defaultCanvasContext.lineJoin);
    parentList.forEach(current => {
      // current.getFillAndStrokeStyle(renderingContext);
      const opacity = current.getComputedOpacity();
      const fillOpacity = current.getExtendAttr('fillOpacity') * opacity;
      const strokeOpacity = current.getExtendAttr('strokeOpacity') * opacity;
      const lineWidth = current.getExtendAttr('lineWidth');
      const stroke = current.getExtendAttr('stroke');
      const fill = current.getExtendAttr('fill');
      this._setElementCanvasContext(ctx, current, fill, stroke, fillOpacity, strokeOpacity, lineWidth);
    });
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
    if (dpr !== 1 && this.render.scaleByDprBeforePaint) {
      ctx.scale(dpr, dpr);
    }
    // 改变默认的canvas上下文
    styleHelper.setFontStyle(ctx, defaultCanvasContext.fontSize, defaultCanvasContext.fontFamily);
    styleHelper.setTextBaseline(ctx, defaultCanvasContext.textBaseline);
    styleHelper.setLineJoin(ctx, defaultCanvasContext.lineJoin);
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

    this._repaintCount++;

    const opacity = item.getComputedOpacity();
    const fillOpacity = item.getExtendAttr('fillOpacity') * opacity;
    const strokeOpacity = item.getExtendAttr('strokeOpacity') * opacity;
    const lineWidth = item.getExtendAttr('lineWidth');
    const stroke = item.getExtendAttr('stroke');
    const fill = item.getExtendAttr('fill');
    const hasFill = fill && fill !== 'none';
    const hasStroke = stroke && stroke !== 'none' && lineWidth > 0;
    const needFill = hasFill && fillOpacity !== 0 && !isTransparent(fill);
    const needStroke = hasStroke && strokeOpacity !== 0 && !isTransparent(stroke);
    item.needFill = needFill;
    item.needStroke = needStroke;

    // item.getFillAndStrokeStyle(renderingContext);
    // if (isInBatch) {
    //   if (item.isGroup) {
    //     console.warn('batch brush muse be shape element');
    //     return;
    //   }
    //   const shape = item as Shape;
    //   shape.brush(ctx);
    //   return;
    // }

    if (opacity === 0 && !this._isPixelPainter) {
      return;
    }
    const hasSelfContext = this._isPixelPainter ? true : this._hasSelfContext(item, fill, fillOpacity, stroke, strokeOpacity);

    if (hasSelfContext) {
      ctx.save();
      this._setElementCanvasContext(ctx, item, fill, stroke, fillOpacity, strokeOpacity, lineWidth);
    }
    if (!item.isGroup) {
      if (item.fillAble && needFill && !this._isPixelPainter) {
        if (fillOpacity !== strokeOpacity) {
          styleHelper.setGlobalAlpha(ctx, fillOpacity);
        }
      }
      if (item.fillAble || (item.strokeAble && item.type !== 'text')) {
        ctx.beginPath();
      }
      (item as Shape).brush(ctx);
      if (
        item.fillAble &&
        (needFill || (this._isPixelPainter && hasFill)) &&
        item.type !== 'text'
      ) {
        ctx.fill();
      }
      if (item.strokeAble && needStroke && !this._isPixelPainter) {
        if (fillOpacity !== strokeOpacity) {
          styleHelper.setGlobalAlpha(ctx, strokeOpacity);
        }
      }
      if (
        item.strokeAble &&
        (needStroke || (this._isPixelPainter && hasStroke)) &&
        item.type !== 'text'
      ) {
        ctx.stroke();
      }
    } else {
      // const batchBrush = current.attr._batchBrush;
      // if (batchBrush) {
      //   ctx.beginPath();
      // }

      (item as Group).eachChild(child => this.drawElement(ctx, child, dirtyRegions));

      // if (batchBrush) {
      //   if (fill && fill !== 'none') {
      //     ctx.fill();
      //   }
      //   if (stroke && stroke !== 'none') {
      //     ctx.stroke();
      //   }
      // }
    }

    if (!this._isPixelPainter && (this.render.showBBox || this.render.showBoundingRect || item.attr.showBBox || item.attr.showBoundingRect)) {
      this._drawBBox(item);
    }

    if (hasSelfContext) {
      ctx.restore();
    }
  }

  public isFullPaintNextFrame(): boolean {
    return !this.render.enableDirtyRect || this._isFirstFrame;
  }

  public noDirtyRectNextFrame() {
    this._isFirstFrame = true;
  }

  public getBase64(): string {
    return this._canvas.toDataURL('image/png');
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
      canvas.width = Math.max(w * this.render.dpr, 1);
      canvas.height = Math.max(h * this.render.dpr, 1);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      this._canvas = canvas;
      // document.body.appendChild(canvas);
      // canvas.style.cssText = 'margin: 20px;'
    } else {
      try {
        const canvasCreator = getCanvasCreator();
        this._canvas = canvasCreator(this.render.dpr, this.render.dpr);
      } catch (err) {
        this._canvas = this.render.getDom() as HTMLCanvasElement;
      }
    }
    this._ctx = this._canvas.getContext('2d');
  }

  private _applyClip(ctx: CanvasRenderingContext2D, item: Element) {
    if (item.attr.clip) {
      ctx.beginPath();
      item.getClipElement().brush(ctx);
      ctx.clip();
    }
  }

  private _applyTransform(ctx: CanvasRenderingContext2D, item: Element) {
    const selfMatrix = item.getTransform();
    const dragOffset = item.getDragOffset();
    const hasDrag = dragOffset[0] !== 0 || dragOffset[1] !== 0;
    if (hasDrag || selfMatrix !== IDENTRY_MATRIX) {
      if (!hasDrag) {
        ctx.transform(
          selfMatrix[0],
          selfMatrix[1],
          selfMatrix[3],
          selfMatrix[4],
          selfMatrix[6],
          selfMatrix[7],
        );
      } else {
        const globalMatrix = item.getGlobalTransform();
        styleHelper.resetTransform(ctx);
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
      }
    }
  }

  private _setElementCanvasContext(ctx: CanvasRenderingContext2D, item: Element<GroupConf>, computedFill: ColorValue, computedStroke: ColorValue, fillOpacity: number, strokeOpacity: number, lineWidth: number) {
    this._ctxCount++;
    const { lineCap, lineJoin, miterLimit, stroke, fill,  fontSize, fontFamily, fontWeight, fontStyle, fontVariant, textBaseline, textAlign, blendMode, lineDashOffset, shadowBlur, shadowOffsetX, shadowOffsetY, shadowColor, lineDash, } = item.attr;

    if (item.isGroup) {
      this._applyTransform(ctx, item);
      this._applyClip(ctx, item);
    } else {
      this._applyClip(ctx, item);
      this._applyTransform(ctx, item);
    }

    if (item.attr.lineWidth > 0) {
      const offset = this._isPixelPainter ? (item.attr.pickingBuffer || 0) : 0;
      styleHelper.setLineWidth(ctx, lineWidth + offset);
    }

    if (lineCap) {
      styleHelper.setLineCap(ctx, lineCap);
    }

    if (lineJoin) {
      styleHelper.setLineJoin(ctx, lineJoin);
    }

    if (miterLimit >= 0) {
      styleHelper.setMiterLimit(ctx, miterLimit);
    }

    // 文本和图像自己检测, 不走gpu,不故考虑fontSize
    if (this._isPixelPainter && item.type !== 'group') {
      const rgb = item.pickRGB;
      const pickColor = `rgb(${rgb.join(',')})`;
      styleHelper.setFillStyle(ctx, pickColor);
      styleHelper.setStrokeStyle(ctx, pickColor);
      return;
    }

    // group只支持color string, pattern,不支持渐变
    // todo 考虑小程序api setXXXX
    if (stroke && stroke !== 'none' && !(item.isGroup && isGradient(stroke))) {
      styleHelper.setStrokeStyle(ctx, getCtxColor(ctx, stroke, item));
    }

    if (
      !stroke &&
      isGradient(computedStroke) &&
      item.type !== 'group'
    ) {
      styleHelper.setStrokeStyle(ctx, getCtxColor(ctx, computedStroke, item));
    }

    /** 渐变样式无法继承 */
    if (
      fill &&
      fill !== 'none' &&
      !(item.isGroup && isGradient(fill))
    ) {
      styleHelper.setFillStyle(ctx, getCtxColor(ctx, fill, item));
    }

    /** 渐变样式无法继承 */
    if (!fill && isGradient(computedFill) && item.type !== 'group') {
      styleHelper.setStrokeStyle(ctx, getCtxColor(ctx, computedFill, item));
    }

    // todo 兼容小程序
    if (
      fontSize  ||
      fontFamily ||
      fontWeight ||
      fontVariant ||
      fontStyle
    ) {
      const _fontSize = item.getExtendAttr('fontSize');
      const _fontFamily = item.getExtendAttr('fontFamily');
      const _fontWeight = item.getExtendAttr('fontWeight');
      const _fontStyle = item.getExtendAttr('fontStyle');
      // tood gc optimize
      styleHelper.setFontStyle(ctx, _fontSize,_fontFamily,_fontWeight, _fontStyle);
    }

    if (textBaseline) {
      styleHelper.setTextBaseline(ctx, textBaseline);
    }

    if (textAlign) {
      styleHelper.setTextAlign(ctx, textAlign);
    }

    // 透明度相同时不用复用alpha
    if (fillOpacity === strokeOpacity && fillOpacity !== 1) {
      styleHelper.setGlobalAlpha(ctx, fillOpacity);
    }

    if (blendMode) {
      ctx.globalCompositeOperation = blendMode;
    }

    if (lineDash) {
      ctx.setLineDash(lineDash);
    }

    if (lineDashOffset !== undefined) {
      ctx.lineDashOffset = item.attr.lineDashOffset;
    }

    if (shadowBlur > 0 && !isTransparent(shadowColor)) {
      styleHelper.setShadow(
        ctx,
        shadowOffsetX,
        shadowOffsetY,
        shadowBlur,
        shadowColor,
      );
    }

   
  }

  protected _hasSelfContext(item: Element<ShapeConf>, fill: ColorValue, fillOpacity: number, stroke: ColorValue, strokeOpacity: number): boolean {
    if (contextKeys.some(key => item.attr[key] !== undefined)) {
      return true;
    }
    if (isGradient(fill) || isGradient(stroke)) {
      return true;
    }

    if (fillOpacity !== 1 || strokeOpacity !== 1) {
      return true;
    }
    const dragOffset = item.getDragOffset();
    const hasDrag = dragOffset[0] !== 0 || dragOffset[1] !== 0;
    if (hasDrag || item.getTransform() !== IDENTRY_MATRIX) {
      return true;
    }

    return false;
  }

  private _drawBBox(item: Element) {
    if (this.render.showBBox || item.attr.showBBox) {
      this._brushBoundingBBox(item, false);
    }
    if (this.render.showBoundingRect || item.attr.showBoundingRect) {
      this._brushBoundingBBox(item, true);
    }
  }

  private _brushBoundingBBox(item: Element, isClientBBox: boolean) {
    const ctx = this._ctx;
    const bbox = isClientBBox ? item.getBoundingClientRect() : item.getBBox();
    ctx.save();
    if (isClientBBox || item.isGroup) {
      styleHelper.resetTransform(ctx);
      if (this.dpr !== 1) {
        ctx.scale(this.dpr, this.dpr);
      }
    }
    styleHelper.setGlobalAlpha(ctx, 1);
    styleHelper.setLineWidth(ctx, 1);
    styleHelper.setStrokeStyle(ctx, 'red');
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
    fpsText.setAttr('display', this.render.showFPS);
    fpsRect.setAttr('display', this.render.showFPS);
    const frameTimes = this._frameTimes;
    const startTime = frameTimes[0];
    const endTime = frameTimes[frameTimes.length - 1];
    if (endTime === startTime) {
      return;
    }
    const fps = Math.floor((frameTimes.length * 1000) / (endTime - startTime));
    fpsText.setAttr({
      text: fps + ' fps',
    });
    this.drawElement(this._ctx, fpsRect);
    this.drawElement(this._ctx, fpsText);
  }
}
registerPainter('canvas', CanvasPainter);
