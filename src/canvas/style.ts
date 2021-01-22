import {TextConf, } from '../shapes/Text';

export function setFillStyle(ctx: CanvasRenderingContext2D, fill: string | CanvasGradient) {
  if (!ctx.setFillStyle) {
    ctx.fillStyle = fill;
  } else {
    ctx.setFillStyle(fill);
  }
}
export function setFontStyle(ctx: CanvasRenderingContext2D, fontStyle: TextConf): void {
  if (!ctx.setFontSize) {
      ctx.font = ''
  } else {
    ctx.setFontSize(fontStyle.fontSize);
  }
}
export function setGlobalAlpha(ctx: CanvasRenderingContext2D, alpha: number): void {
  if (!ctx.setGlobalAlpha) {
    ctx.globalAlpha = alpha;
  } else {
    ctx.setGlobalAlpha(alpha);
  }
}
export function setLineCap(ctx: CanvasRenderingContext2D, lineCap: CanvasLineCap): void {
  if (!ctx.setLineCap) {
    ctx.lineCap = lineCap;
  } else {
    ctx.setLineCap(lineCap);
  }
}
export function setLineJoin(ctx: CanvasRenderingContext2D, lineJoin: CanvasLineJoin): void {
  if (!ctx.setLineJoin) {
    ctx.lineJoin = lineJoin;
  } else {
    ctx.setLineJoin(lineJoin);
  }
}
export function setMiterLimit(ctx: CanvasRenderingContext2D, miterLimit: number): void {
  if (!ctx.setMiterLimit) {
    ctx.miterLimit = miterLimit;
  } else {
    ctx.setMiterLimit(miterLimit);
  }
}
export function setShadow(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, blur: number, color: string): void {
  if (!ctx.setShadow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = offsetX;
    ctx.shadowOffsetY = offsetY;
  } else {
    ctx.setShadow(offsetX, offsetY, blur, color);
  }
}
export function setStrokeStyle(ctx: CanvasRenderingContext2D, stroke: string | CanvasGradient): void {
  if (!ctx.setStrokeStyle) {
    ctx.strokeStyle = stroke;
  } else {
    ctx.setStrokeStyle(stroke);
  }
}
export function setTextAlign(ctx: CanvasRenderingContext2D, textAlign: CanvasTextAlign): void {
  if (!ctx.setTextAlign) {
    ctx.textAlign = textAlign;
  } else {
    ctx.setTextAlign(textAlign);
  }
}
export function setTextBaseline(ctx: CanvasRenderingContext2D, textBaseline: CanvasTextBaseline): void {
  if (!ctx.setTextBaseline) {
    ctx.textBaseline = textBaseline;
  } else {
    ctx.setTextBaseline(textBaseline);
  }
}