import Painter from '../abstract/Painter';
import Render from '../render';
import Element, { defaultCanvasContext } from '../shapes/Element';
import Shape, { ShapeAttr } from '../shapes/Shape';
import Group, { GroupAttr } from '../shapes/Group';
import { BBox, bboxIntersect } from '../utils/bbox';
import mergeDirtyRegions from './dirtyRect';
import { getCtxColor, isGradient, isPattern, Pattern, isTransparent, ColorValue } from '../color';
import { IDENTRY_MATRIX } from '../constant';
import * as styleHelper from '../canvas/style';
import { getCanvasCreator } from '../canvas/createCanvas';
import { fpsRect, fpsText } from './fps';
import { isArray } from 'lodash-es';

const contextKeys: Array<keyof ShapeAttr> = [
  'fill',
  'fontSize',
  'blendMode',
  'lineCap',
  'opacity',
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

  private _isFirstFrame: boolean = true;

  private _paintPosition: [number, number];

  private _frameTimes: number[] = [];

  private _viewPort: BBox;

  private _inUse: boolean = false;

  private _contextFill: ColorValue;

  private _contextStroke: ColorValue;

  public constructor(render: Render, isPixelPainter: boolean = false) {
    this.render = render;
    this._isPixelPainter = isPixelPainter;
    this.dpr = isPixelPainter ? 1 : render.dpr;
    isPixelPainter ? this._initPixelCanvas() : this._initCanvas();
    if (this.render.isBrowser() && !isPixelPainter) {
      // tab switch must redraw
      document.addEventListener('visibilitychange', this._handleDocumentVisibilityChange);
      window.addEventListener('resize', this._handleWindowResize);
    }
    this._viewPort = { x: 0, y: 0, width: render.getWidth(), height: render.getHeight() };
  }

  public resize(width: number, height: number, dpr?: number) {
    this.dpr = dpr ?? this.dpr;
    this._canvas.width = width * this.dpr;
    this._canvas.height = height * this.dpr;
    if (this.render.isBrowser()) {
      this._canvas.style.width = width + 'px';
      this._canvas.style.height = height + 'px';
    }
    this._viewPort.width = width;
    this._viewPort.height = height;
    this.render.dirty();
  }

  public onFrame(now?: number) {
    if (!this._ctx) {
      return;
    }
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
    const chunk = this.render.getOneChunk();
    if (needUpdate) {
      if (
        !this._isFirstFrame &&
        this.render.enableDirtyRect &&
        dirytCount > 0 &&
        dirytCount <= maxDirtyRects
      ) {
        this.paintInDirtyRegion();
      } else {
        // full screen paint
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
    return this._ctx.getImageData(x, y, width, height);
  }

  public getCanvas() {
    return this._canvas;
  }

  public getCanvasContext() {
    return this._canvas?.getContext('2d');
  }

  public getContext(): CanvasRenderingContext2D {
    return this._ctx;
  }

  public clearCanvas() {
    this._canvas.getContext('2d').clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  public setContext(ctx: CanvasRenderingContext2D) {
    this._ctx = ctx;
  }

  public paintAt(x: number, y: number) {
    this._paintPosition = [x, y];
    const ctx = this._ctx;
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

    this.render.getRoot().eachChild(item => this.drawElement(item));
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
    const renderBbox = {
      x: 0,
      y: 0,
      width: this.render.getWidth(),
      height: this.render.getHeight(),
    };
    dirtyRegions = dirtyRegions.filter(region => bboxIntersect(region, renderBbox));
    if (dirtyRegions.length === 0) {
      return;
    }
    this.paint(mergeDirtyRegions(dirtyRegions, this.render.dpr));
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
      this._setElementCanvasContext(
        ctx,
        current,
        fill,
        stroke,
        fillOpacity,
        strokeOpacity,
        lineWidth,
      );
    });
    chunk.forEach(item => this.drawElement(item));
    ctx.restore();
  }

  public paint(dirtyRegion?: BBox) {
    // console.time('paint');
    const ctx = this._ctx;
    const dpr = this.dpr;
    if (!dirtyRegion) {
      ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    } else {
      const { x, y, width, height } = dirtyRegion;
      ctx.clearRect(x * dpr, y * dpr, width * dpr, height * dpr);
    }
    ctx.save();
    if (dpr !== 1 && this.render.scaleByDprBeforePaint) {
      ctx.scale(dpr, dpr);
    }
    styleHelper.setFontStyle(ctx, defaultCanvasContext.fontSize, defaultCanvasContext.fontFamily);
    styleHelper.setTextBaseline(ctx, defaultCanvasContext.textBaseline);
    styleHelper.setLineJoin(ctx, defaultCanvasContext.lineJoin);

    if (dirtyRegion) {
      ctx.beginPath();
      this._brushRect(ctx, dirtyRegion);
      ctx.clip();
    }
    this.render.getRoot().eachChild(item => this.drawElement(item, dirtyRegion));
    ctx.restore();
    // console.timeEnd('paint');
  }

  public drawElementInUse(el: Element) {
    this._inUse = true;
    this.drawElement(el);
    this._inUse = false;
  }

  public drawElement = (item: Element, dirtyRegion?: BBox) => {
    if (Element.isHookElement(item)) {
      item.eachChild(child => this.drawElement(child, dirtyRegion));
      return;
    }
    const ctx = this._ctx;
    item.clearDirty();

    if (!item.attr.display) {
      return;
    }

    if (this._isPixelPainter && !item.pickRGB && !item.isGroup) {
      return;
    }

    if (dirtyRegion) {
      const bbox = item.getCurrentDirtyRect();
      const isDirty = bboxIntersect(dirtyRegion, bbox);
      if (!isDirty) {
        return;
      }
    }

    if (this.render.enableViewportCulling) {
      const bbox = item.getCurrentDirtyRect();
      const isInViewport = bboxIntersect(this._viewPort, bbox);
      if (!isInViewport) {
        return;
      }
    }

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
    const hasSelfContext = this._isPixelPainter
      ? true
      : this._hasSelfContext(item, fill, fillOpacity, stroke, strokeOpacity);

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
        item.type !== 'text' &&
        !(isPattern(fill) && !(fill as Pattern).isReady())
      ) {
        if (!isArray(fill)) {
          ctx.fill();
        } else {
          fill.forEach(fillColor => {
            styleHelper.setFillStyle(ctx, getCtxColor(ctx, fillColor, item));
            ctx.fill();
          })
        }
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

      // render marker
      if (!this._isPixelPainter) {
        if (item.attr.markerStart) {
          item.attr.markerStart.renderMarker(this, item as Shape, 'start');
        }
        if (item.attr.markerEnd) {
          item.attr.markerEnd.renderMarker(this, item as Shape, 'end');
        }
      }
    } else {
      // const batchBrush = current.attr._batchBrush;
      // if (batchBrush) {
      //   ctx.beginPath();
      // }

      (item as Group).eachChild(child => this.drawElement(child, dirtyRegion));

      // if (batchBrush) {
      //   if (fill && fill !== 'none') {
      //     ctx.fill();
      //   }
      //   if (stroke && stroke !== 'none') {
      //     ctx.stroke();
      //   }
      // }
    }

    if (
      !this._isPixelPainter &&
      (this.render.showBBox ||
        this.render.showBoundingRect ||
        item.attr.showBBox ||
        item.attr.showBoundingRect)
    ) {
      this._drawBBox(item);
    }

    if (hasSelfContext) {
      ctx.restore();
    }
  };

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
      window.removeEventListener('resize', this._handleWindowResize);
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
      this._canvas.width = width * dpr;
      this._canvas.height = height * dpr;
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
        if (!this._canvas.getContext) {
          throw new Error('not a canvas');
        }
      } catch (err) {
        this._canvas = this.render.getDom() as HTMLCanvasElement;
      }
    }
    this._ctx = this._canvas.getContext('2d');
  }

  private _applyTransform(ctx: CanvasRenderingContext2D, item: Element) {
    const selfMatrix = item.getTransform();
    const dragOffset = item.getDragOffset();
    const hasDrag = dragOffset[0] !== 0 || dragOffset[1] !== 0;
    if (hasDrag || selfMatrix !== IDENTRY_MATRIX) {
      if (!hasDrag || this._inUse) {
        if (hasDrag && this._inUse) {
          ctx.translate(dragOffset[0], dragOffset[1]);
        }
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

  private _setElementCanvasContext(
    ctx: CanvasRenderingContext2D,
    item: Element<GroupAttr>,
    computedFill: ColorValue | ColorValue[],
    computedStroke: ColorValue,
    fillOpacity: number,
    strokeOpacity: number,
    lineWidth: number,
  ) {
    const {
      clip,
      lineCap,
      lineJoin,
      miterLimit,
      stroke: attrStroke,
      fill: attrFill,
      fontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      fontVariant,
      textBaseline,
      textAlign,
      blendMode,
      lineDashOffset,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
      shadowColor,
      lineDash,
    } = item.attr;
    let fill = attrFill;
    let stroke = attrStroke;

    this._applyTransform(ctx, item);

    if (clip) {
      ctx.beginPath();
      item.getClipElement().brush(ctx);
      ctx.clip();
    }

    if (item.attr.lineWidth > 0) {
      const offset = this._isPixelPainter ? item.attr.pickingBuffer || 0 : 0;
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

    if (this._isPixelPainter && !item.isGroup) {
      const rgb = item.pickRGB;
      const pickColor = `rgb(${rgb.join(',')})`;
      styleHelper.setFillStyle(ctx, pickColor);
      styleHelper.setStrokeStyle(ctx, pickColor);
      return;
    }

    if (fill && fill !== 'context-fill' && fill !== 'context-stroke') {
      this._contextFill = fill as ColorValue;
    }

    if (stroke && stroke !== 'context-fill' && stroke !== 'context-stroke') {
      this._contextStroke = stroke;
    }

    if (fill === 'context-fill' || fill === 'context-stroke') {
      fill = fill === 'context-fill' ? this._contextFill : this._contextStroke;
    }
    if (stroke === 'context-fill' || stroke === 'context-stroke') {
      stroke = stroke === 'context-fill' ? this._contextFill : this._contextStroke;
    }

    if (stroke && stroke !== 'none' && !(item.isGroup && isGradient(stroke))) {
      styleHelper.setStrokeStyle(ctx, getCtxColor(ctx, stroke, item));
    }

    if (!stroke && isGradient(computedStroke) && !item.isGroup) {
      styleHelper.setStrokeStyle(ctx, getCtxColor(ctx, computedStroke, item));
    }

    // gradient color can't be extended
    if (fill && fill !== 'none' && !isArray(fill) && !(item.isGroup && isGradient(fill))) {
      styleHelper.setFillStyle(ctx, getCtxColor(ctx, fill, item));
    }

    if (!fill && isGradient(computedFill) && !item.isGroup) {
      styleHelper.setFillStyle(ctx, getCtxColor(ctx, computedFill, item));
    }

    if (fontSize || fontFamily || fontWeight || fontVariant || fontStyle) {
      const _fontSize = item.getExtendAttr('fontSize');
      const _fontFamily = item.getExtendAttr('fontFamily');
      const _fontWeight = item.getExtendAttr('fontWeight');
      const _fontStyle = item.getExtendAttr('fontStyle');
      // tood gc optimize
      styleHelper.setFontStyle(ctx, _fontSize, _fontFamily, _fontWeight, _fontStyle);
    }

    if (textBaseline) {
      styleHelper.setTextBaseline(ctx, textBaseline);
    }

    if (textAlign) {
      styleHelper.setTextAlign(ctx, textAlign);
    }

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
      styleHelper.setShadow(ctx, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor);
    }
  }

  protected _hasSelfContext(
    item: Element<ShapeAttr>,
    fill: ColorValue | ColorValue[],
    fillOpacity: number,
    stroke: ColorValue,
    strokeOpacity: number,
  ): boolean {
    if (contextKeys.some(key => item.attr[key] !== undefined)) {
      return true;
    }
    if (isGradient(fill) || isGradient(stroke) || (isArray(fill) && fill.length)) {
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
    ctx.rect(x, y, width, height);
  }

  private _handleDocumentVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      this._isFirstFrame = true;
    }
  };

  private _handleWindowResize = () => {
    if (!this.render.autoDpr) {
      return;
    }
    this._isFirstFrame = true;
    if (window.devicePixelRatio !== this.dpr) {
      this.resize(this.render.getWidth(), this.render.getHeight(), window.devicePixelRatio);
      this.render.getRoot().traverse(node => {
        const { fill } = node.attr;
        if (isPattern(fill)) {
          fill.reload();
        }
      })
    }
  }

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
    this.drawElement(fpsRect);
    this.drawElement(fpsText);
  }
}
