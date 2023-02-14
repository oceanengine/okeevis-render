import {
  lineJoinMap,
  textAlignMap,
  LineCapMap,
  textBaselineMap,
  ColorType,
  PatternRepeat,
} from './types';

interface PatternRecord {
  data: ImageBitmap;
  transform: number[];
  repeat: string;
}

const imageRecord: Record<string, ImageBitmap> = {};

export function loadImage(id: number, image: ImageBitmap) {
  imageRecord[id] = image;
}

export function executeCommand(
  buffer: ArrayBuffer,
  ctx: CanvasRenderingContext2D,
  canvas: OffscreenCanvas,
) {
  let offset = 0;
  const dv = new DataView(buffer);
  const actionList = [
    direction,
    fillStyle,
    filter,
    font,
    globalAlpha,
    globalCompositeOperation,
    imageSmoothingEnabled,
    imageSmoothingQuality,
    lineCap,
    lineDashOffset,
    lineJoin,
    lineWidth,
    miterLimit,
    shadowBlur,
    shadowColor,
    shadowOffsetX,
    shadowOffsetY,
    strokeStyle,
    textAlign,
    textBaseline,
    setLineDash,
    setTransform,
    arc,
    arcTo,
    beginPath,
    bezierCurveTo,
    clearRect,
    clip,
    closePath,
    createConicGradient,
    createImageData,
    createLinearGradient,
    createPattern,
    createRadialGradient,
    drawImage,
    ellipse,
    fill,
    fillRect,
    fillText,
    lineTo,
    moveTo,
    putImageData,
    quadraticCurveTo,
    rect,
    resetTransform,
    restore,
    rotate,
    save,
    scale,
    stroke,
    strokeRect,
    strokeText,
    transform,
    translate,
    resize,
    // measureText
  ];
  let action = readAction();
  while (action) {
    actionList[action - 1]();
    action = readAction();
  }
  function direction() {
    ctx.direction = readText() as any;
  }
  function fillStyle() {
    ctx.fillStyle = readColor();
  }
  function filter() {
    ctx.filter = readText();
  }
  function font() {
    ctx.font = readText();
  }
  function globalAlpha() {
    ctx.globalAlpha = readf32();
  }
  function globalCompositeOperation() {
    ctx.globalCompositeOperation = readText() as CanvasCompositing['globalCompositeOperation'];
  }
  function imageSmoothingEnabled() {}
  function imageSmoothingQuality() {}
  function lineCap() {
    ctx.lineCap = LineCapMap[readu8()] as CanvasLineCap;
  }
  function lineDashOffset() {
    ctx.lineDashOffset = readf32();
  }
  function lineJoin() {
    ctx.lineJoin = lineJoinMap[readu8()] as CanvasLineJoin;
  }
  function lineWidth() {
    ctx.lineWidth = readf32();
  }
  function miterLimit() {
    ctx.miterLimit = readf32();
  }
  function shadowBlur() {
    ctx.shadowBlur = readf32();
  }
  function shadowColor() {
    ctx.shadowColor = readRgbaColor();
  }
  function shadowOffsetX() {
    ctx.shadowOffsetX = readf32();
  }
  function shadowOffsetY() {
    ctx.shadowOffsetX = readf32();
  }
  function strokeStyle() {
    ctx.strokeStyle = readColor();
  }
  function textAlign() {
    ctx.textAlign = textAlignMap[readu8()] as CanvasTextAlign;
  }
  function textBaseline() {
    ctx.textBaseline = textBaselineMap[readu8()] as CanvasTextBaseline;
  }
  function setLineDash() {
    const len = readu32();
    const dashArray: number[] = [];
    for (let i = 0; i < len; i++) {
      dashArray.push(readf32());
    }
    ctx.setLineDash(dashArray);
  }

  function setTransform() {
    ctx.setTransform(readf32(), readf32(), readf32(), readf32(), readf32(), readf32());
  }

  function arc() {
    ctx.arc(readf32(), readf32(), readf32(), readf32(), readf32(), readBoolean());
  }
  function arcTo() {
    ctx.arcTo(readf32(), readf32(), readf32(), readf32(), readf32());
  }
  function beginPath() {
    ctx.beginPath();
  }
  function bezierCurveTo() {
    ctx.bezierCurveTo(readf32(), readf32(), readf32(), readf32(), readf32(), readf32());
  }
  function clearRect() {
    ctx.clearRect(readf32(), readf32(), readf32(), readf32());
  }
  function clip() {
    ctx.clip();
  }
  function closePath() {
    ctx.closePath();
  }
  function createConicGradient() {}
  function createImageData() {}
  function createLinearGradient() {}
  function createPattern() {}
  function createRadialGradient() {}
  function drawImage() {
    const imageId = readu32();
    const arglen = readu8();
    const args: number[] = [];
    for (let i = 0; i < arglen - 1; i++) {
      args.push(readf32());
    }
    ctx.drawImage.apply(ctx, [imageRecord[imageId], ...args]);
  }
  function ellipse() {
    ctx.ellipse(
      readf32(),
      readf32(),
      readf32(),
      readf32(),
      readf32(),
      readf32(),
      readf32(),
      readBoolean(),
    );
  }
  function fill() {
    ctx.fill();
  }
  function fillRect() {
    ctx.fillRect(readf32(), readf32(), readf32(), readf32());
  }
  function fillText() {
    ctx.fillText(readText(), readf32(), readf32());
  }
  function lineTo() {
    ctx.lineTo(readf32(), readf32());
  }
  function moveTo() {
    ctx.moveTo(readf32(), readf32());
  }
  function putImageData() {}
  function quadraticCurveTo() {
    ctx.quadraticCurveTo(readf32(), readf32(), readf32(), readf32());
  }
  function rect() {
    ctx.rect(readf32(), readf32(), readf32(), readf32());
  }
  function resetTransform() {
    ctx.resetTransform();
  }
  function restore() {
    ctx.restore();
  }
  function rotate() {
    ctx.rotate(readf32());
  }
  function save() {
    ctx.save();
  }
  function scale() {
    ctx.scale(readf32(), readf32());
  }
  function stroke() {
    ctx.stroke();
  }
  function strokeRect() {
    ctx.strokeRect(readf32(), readf32(), readf32(), readf32());
  }
  function strokeText() {
    ctx.strokeText(readText(), readf32(), readf32());
  }
  function transform() {
    ctx.transform(readf32(), readf32(), readf32(), readf32(), readf32(), readf32());
  }
  function translate() {
    ctx.translate(readf32(), readf32());
  }

  function resize() {
    canvas.width = readf32();
    canvas.height = readf32();
  }

  function readBoolean(): boolean {
    return !!readu8();
  }

  function readu8() {
    let value = dv.getUint8(offset);
    offset += 1;
    return value;
  }
  function readu16() {
    let value = dv.getUint16(offset);
    offset += 2;
    return value;
  }

  function readf32() {
    let value = dv.getFloat32(offset);
    offset += 4;
    return value;
  }

  function readu32() {
    let value = dv.getUint32(offset);
    offset += 4;
    return value;
  }

  function readAction() {
    const action = readu8();
    return action;
  }

  function readRgbaColor(): string {
    return readText();
    // const r = readu8();
    // const g = readu8();
    // const b = readu8();
    // const a = readf32();
    // return rgba
  }

  function readColor(): string | CanvasGradient | CanvasPattern {
    const type = readu8();
    if (type === ColorType.STRING_COLOR) {
      return readRgbaColor();
    } else if (type === ColorType.LINEAR_GRADIENT) {
      const gradient = ctx.createLinearGradient(readf32(), readf32(), readf32(), readf32());
      return readColorStop(gradient);
    } else if (type === ColorType.RADIAL_GRADIENT) {
      const gradient = ctx.createRadialGradient(
        readf32(),
        readf32(),
        readf32(),
        readf32(),
        readf32(),
        readf32(),
      );
      return readColorStop(gradient);
    } else if (type === ColorType.CONIC_GRADIENT) {
      const gradient = ctx.createConicGradient(readf32(), readf32(), readf32());
      return readColorStop(gradient);
    } else if (type === ColorType.PATTERN) {
      const imageId = readu32();
      const repeat = PatternRepeat[readu8()];
      const hasTransform = readBoolean();
      const pattern = ctx.createPattern(imageRecord[imageId], repeat);
      if (hasTransform) {
        pattern.setTransform(
          new DOMMatrix([readf32(), readf32(), readf32(), readf32(), readf32(), readf32()]),
        );
      }
      return pattern;
    }
  }

  function readColorStop(gradient: CanvasGradient) {
    const len = readu32();
    for (let i = 0; i < len; i++) {
      const offset = readf32();
      const color = readRgbaColor();
      gradient.addColorStop(offset, color);
    }
    return gradient;
  }

  function readText(): string {
    let len = readu32();
    let str = '';
    for (let i = 0; i < len; i++) {
      str += String.fromCharCode(readu16());
    }
    return str;
  }
}
