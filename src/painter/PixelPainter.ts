import Render from '../render';
import Element, { CommonAttr } from '../shapes/Element';
import Shape from '../shapes/Shape';
import Group, { GroupConf } from '../shapes/Group';
import * as lodash from '../utils/lodash';
import * as mat3 from '../../js/mat3';
import { getCtxColor, isGradient } from '../color';

export interface RenderingContext extends CommonAttr {}
const identityMat3 = mat3.create();

export default class PixelPainter {
  public render: Render;

  public dpr: number;

  private _canvas: HTMLCanvasElement;

  public constructor(render: Render) {
    this.render = render;
    this.dpr = render.dpr;
    this._initPixelCanvas();
    
  }

  public getImageData(x: number, y: number, width: number, height: number): ImageData {
    return this._canvas.getContext('2d').getImageData(x, y, width, height);
  }

  public paintAt(x: number, y: number) {
    const ctx = this._canvas.getContext('2d');
    const elements = this.render.getAllElements();
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    const dpr = this.dpr;
    ctx.save();
    if (dpr !== 1) {
      ctx.scale(dpr, dpr);
    }
    ctx.translate(-x, -y);
    elements.forEach(item => this.drawElement(ctx, item));
    ctx.restore();
  }

  public initCanvasContext(ctx: CanvasRenderingContext2D, item: Element<GroupConf>) {
    const {
      stroke,
      fill,
      fontSize,
      fontFamily,
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
    } = item.attr;

    const {fillOpacity, strokeOpacity, fill: computedFill, stroke: computedStroke} = item.getFillAndStrokeStyle();

    // group只支持color string, pattern,不支持渐变
    // todo 考虑小程序api setXXXX
    if (stroke && !(item.type === 'group' && isGradient(stroke))) {
      ctx.strokeStyle = getCtxColor(ctx, stroke, item);
    }

    if (!stroke && isGradient(computedStroke) && item.type !== 'group') {
      ctx.strokeStyle = getCtxColor(ctx, computedStroke, item);
    }

    if (fill && !(item.type === 'group' && isGradient(fill))) {
      ctx.fillStyle = getCtxColor(ctx, fill, item);
    }

    if (!fill && isGradient(computedFill) && item.type !== 'group') {
      ctx.strokeStyle = getCtxColor(ctx, computedFill, item);
    }

    // 像素拾取使用背景矩形,不需要这些字体样式.
    if (fontSize || fontFamily) {
      ctx.font = `${fontSize}px sans-serif`;
    }

    if (textBaseline) {
      ctx.textBaseline = textBaseline;
    }

    if (textAlign) {
      ctx.textAlign = textAlign;
    }

    // 透明度相同时不用复用alpha
    if (fillOpacity === strokeOpacity && (fillOpacity  !== 1)) {
      ctx.globalAlpha = fillOpacity;
    }

    if (blendMode) {
      ctx.globalCompositeOperation = blendMode;
    }

    if (lineCap) {
      ctx.lineCap = lineCap;
    }

    if (lineDashOffset) {
      ctx.lineDashOffset = lineDashOffset;
    }

    if (lineJoin) {
      ctx.lineJoin = lineJoin;
    }

    if (lineWidth >= 0) {
      ctx.lineWidth = lineWidth;
    }

    if (miterLimit) {
      ctx.miterLimit = miterLimit;
    }

    if (shadowBlur > 0) {
      ctx.shadowBlur = shadowBlur;
      ctx.shadowColor = shadowColor;
      ctx.shadowOffsetX = shadowOffsetX;
      ctx.shadowOffsetY = shadowOffsetY;
    }

    if (!lodash.isUndefined(lineDash)) {
      ctx.setLineDash(lineDash || [])
    }

    const matrix3 = item.getTransform();
    if (!mat3.equals(matrix3, identityMat3)) {
      ctx.transform(matrix3[0], matrix3[1], matrix3[3], matrix3[4], matrix3[6], matrix3[7]);
    }

    if ((item as Shape).attr.clip) {
      ctx.beginPath();
      (item as Shape).attr.clip.brush(ctx);
      ctx.clip();
    }
  }

  public drawElement(
    ctx: CanvasRenderingContext2D,
    item: Element,
  ) {
    const {display, opacity, batchBrush, } = item.attr;
    const {fill, stroke, fillOpacity, strokeOpacity, hasFill, hasStroke, } = item.getFillAndStrokeStyle();
    if (display === false) {
      return;
    }
    if (fillOpacity === 0 && strokeOpacity === 0) {
      return;
    }

    ctx.save();

    this.initCanvasContext(ctx, item);
    if (item.type !== 'group') {
      const current = item as Shape;
      if (item.fillAble || item.strokeAble) {
        ctx.beginPath();
      }
      current.brush(ctx);
      if (hasFill && item.fillAble && fillOpacity !== 0) {
        if (fillOpacity !== strokeOpacity) {
          ctx.globalAlpha = opacity * fillOpacity;
        }
         ctx.fill();
      }
      if (hasStroke && item.strokeAble && strokeOpacity !== 0) {
        if (fillOpacity !== strokeOpacity) {
          ctx.globalAlpha = opacity * strokeOpacity;
        }
        ctx.stroke();
      }
    } else {
      const current = item as Group;
      if (batchBrush) {
        ctx.beginPath();
      }
      current.children().forEach(child => this.drawElement(ctx, child));
    }
    ctx.restore();
  }

  public dispose() {}

  private _initPixelCanvas() {
    if (this.render.isBrowser()) {
      const canvas = document.createElement('canvas');
      // todo 考虑dpr < 1 (缩放的场景)
      canvas.width = this.dpr * 10;
      canvas.height = this.dpr * 10;
      canvas.style.width = '1px';
      canvas.style.width = '1px';
      this._canvas = canvas;
      document.body.appendChild(canvas);
      canvas.style.cssText = 'margin: 20px;'
    } else {
      this._canvas = this.render.getDom() as HTMLCanvasElement;
    }
  }
}
