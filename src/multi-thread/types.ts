export interface MessageExecuteBuffer {
  type: 'execute';
  images: ImageBitmap[];
  imageIds: number[];
  buffers: ArrayBuffer[];
}

export interface MessageWorkerFrame {
  type: 'frame';
  canvas: ImageBitmap;
}

export enum ACTION {
  direction = 1,
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
}

export enum ColorType {
  STRING_COLOR,
  LINEAR_GRADIENT,
  CONIC_GRADIENT,
  RADIAL_GRADIENT,
  PATTERN,
}

export enum LineCapMap {
  butt,
  round,
  square,
}

export enum textAlignMap {
  start,
  left,
  right,
  center,
  end,
}
export enum textBaselineMap {
  top,
  middle,
  bottom,
  alphabetic,
  hanging,
  ideographic,
}
export enum lineJoinMap {
  round,
  bevel,
  miter,
}

export enum PatternRepeat {
  repeat,
  'repeat-x',
  'repeat-y',
  'no-repeat'
}