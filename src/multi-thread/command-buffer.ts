import {
  Gradient,
  LinearGradient,
  RadialGradient,
  ConicGradient,
  Pattern,
  ColorStop,
  isGradient,
  isLinearGradient,
  isRadialGradient,
  isConicGradient,
  isPattern,
  loadImage,
} from './color';
import { ACTION, lineJoinMap, textAlignMap, LineCapMap, textBaselineMap, ColorType, PatternRepeat } from './types';

const MAX_SIZE = 32768; // pow(2, 15)
const MAX_OFFSET = MAX_SIZE - 100;

export interface FrameData {
  buffers: ArrayBuffer[];
  images: Map<number, OffscreenCanvas>;
}

export class CommandBufferEncoder {
  $$isCommandBuffer: boolean = true;

  private _commandBufferList: ArrayBuffer[] = [];
  private _commandBuffer: ArrayBuffer;
  private _dataview: DataView;
  private _byteOffset: number = 0;
  private _actionCount: number = 0;
  private _onCommit: (frameData: FrameData) => void = undefined;
  private _onStart: () => void;
  private _images: Map<number, OffscreenCanvas> = new Map();

  public constructor(config: { onCommit?: (frameData: FrameData) => void; onStart: () => void }) {
    this._onCommit = config.onCommit;
    this._onStart = config.onStart;
  }

  public start(width: number, height: number) {
    this._onStart?.();
    this._commandBufferList.length = 0;
    this.resetBuffer();
    this.appendAction(ACTION.resize);
    this._writef32(width);
    this._writef32(height);
  }

  public getCommandBuffer(): ArrayBuffer {
    return this._commandBuffer;
  }

  public commit() {
    this.commitBuffer(true);
  }

  public set fillStyle(color: string) {
    this.appendAction(ACTION.fillStyle);
    this.appendColor(color);
  }

  public set filter(filter: string) {
    this.appendAction(ACTION.filter);
    this.appendText(filter);
  }

  public set font(text: string) {
    this.appendAction(ACTION.font);
    this.appendText(text);
  }

  public set globalAlpha(alpha: number) {
    this.appendAction(ACTION.globalAlpha);
    this._writef32(alpha);
  }

  public set globalCompositeOperation(p: any) {
    this.appendAction(ACTION.globalCompositeOperation);
    this.appendText(p);
  }

  public set lineCap(cap: CanvasLineCap) {
    this.appendAction(ACTION.lineCap);
    this._writeu8(LineCapMap[cap]);
  }

  public set lineDashOffset(offset: number) {
    this.appendAction(ACTION.lineDashOffset);
    this._writef32(offset);
  }

  public set lineJoin(join: CanvasLineJoin) {
    this.appendAction(ACTION.lineJoin);
    this._writeu8(lineJoinMap[join]);
  }

  public set lineWidth(width: number) {
    this.appendAction(ACTION.lineWidth);
    this._writef32(width);
  }

  public set miterLimit(limit: number) {
    this.appendAction(ACTION.miterLimit);
    this._writef32(limit);
  }

  public set shadowBlur(blur: number) {
    this.appendAction(ACTION.shadowBlur);
    this._writef32(blur);
  }

  public set shadowColor(color: string) {
    this.appendAction(ACTION.shadowColor);
    this._writeStringColor(color);
  }
  public set shadowOffsetX(x: number) {
    this.appendAction(ACTION.shadowOffsetX);
    this._writef32(x);
  }

  public set shadowOffsetY(y: number) {
    this.appendAction(ACTION.shadowOffsetY);
    this._writef32(y);
  }

  public set strokeStyle(style: string) {
    this.appendAction(ACTION.strokeStyle);
    this.appendColor(style);
  }

  public set textAlign(align: CanvasTextAlign) {
    this.appendAction(ACTION.textAlign);
    this._writeu8(textAlignMap[align]);
  }

  public set textBaseline(baseline: CanvasTextBaseline) {
    this.appendAction(ACTION.textBaseline);
    this._writeu8(textBaselineMap[baseline]);
  }

  public setLineDash(lineDash: number[], offset?: number): void {
    this.appendAction(ACTION.setLineDash);
    this._writeu32(lineDash.length);
    lineDash.forEach(item => this._writef32(item));
  }

  public setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.appendAction(ACTION.setTransform);
    this._writef32(a);
    this._writef32(b);
    this._writef32(c);
    this._writef32(d);
    this._writef32(e);
    this._writef32(f);
  }

  public arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise: boolean = false,
  ): void {
    this.appendAction(ACTION.arc);
    this._writef32(x);
    this._writef32(y);
    this._writef32(radius);
    this._writef32(startAngle);
    this._writef32(endAngle);
    this._writeBoolean(counterclockwise);
  }

  public arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    this.appendAction(ACTION.arcTo);
    this._writef32(x1);
    this._writef32(y1);
    this._writef32(x2);
    this._writef32(y2);
    this._writef32(radius);
  }

  public beginPath(): void {
    this.appendAction(ACTION.beginPath);
  }

  public bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
  ): void {
    this.appendAction(ACTION.bezierCurveTo);
    this._writef32(cp1x);
    this._writef32(cp1y);
    this._writef32(cp2x);
    this._writef32(cp2y);
    this._writef32(x);
    this._writef32(y);
  }

  public clearRect(x: number, y: number, w: number, h: number): void {
    this.appendAction(ACTION.clearRect);
    this._writef32(x);
    this._writef32(y);
    this._writef32(w);
    this._writef32(h);
  }

  public clip(): void {
    this.appendAction(ACTION.clip);
  }

  public closePath(): void {
    this.appendAction(ACTION.closePath);
  }

  public drawImage(image: CanvasImageSource, dx: number, dy: number): void;
  public drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void;
  public drawImage(
    image: CanvasImageSource,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ): void;
  public drawImage(
    image: unknown,
    sx: unknown,
    sy: unknown,
    sw?: unknown,
    sh?: unknown,
    dx?: unknown,
    dy?: unknown,
    dw?: unknown,
    dh?: unknown,
  ): void {
    this.appendAction(ACTION.drawImage);
    const { id, canvas } = loadImage(image as HTMLImageElement);
    const arglen = arguments.length;
    this._writeu32(id);
    this._writeu8(arglen);
    this._images.set(id, canvas);
    for (let i = 1; i < arglen; i++) {
      this._writef32(arguments[i]);
    }
  }

  public createLinearGradient(x0: number, y0: number, x1: number, y1: number): LinearGradient {
    return new LinearGradient(x0, y0, x1, y1);
  }

  public createConicGradient(startAngle: number, x: number, y: number) {
    return new ConicGradient(startAngle, x, y);
  }

  public createRadialGradient(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number,
  ): CanvasGradient {
    return new RadialGradient(x0, y0, r0, x1, y1, r1);
  }

  public createPattern(image: HTMLImageElement, repetition: any): Pattern {
    return new Pattern(image, repetition);
  }

  public ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean,
  ): void {
    this.appendAction(ACTION.ellipse);
    this._writef32(x);
    this._writef32(y);
    this._writef32(radiusX);
    this._writef32(radiusY);
    this._writef32(rotation);
    this._writef32(startAngle);
    this._writef32(endAngle);
    this._writeBoolean(counterclockwise);
  }

  public fill(): void {
    this.appendAction(ACTION.fill);
  }

  public fillRect(x: number, y: number, w: number, h: number): void {
    this.appendAction(ACTION.fillRect);
    this._writef32(x);
    this._writef32(y);
    this._writef32(w);
    this._writef32(h);
  }

  public fillText(text: string, x: number, y: number, maxWidth?: number): void {
    if (text.length * 2 > this._commandBuffer.byteLength - this._byteOffset - 100) {
      this.commitBuffer();
    }
    this.appendAction(ACTION.fillText);
    this.appendText(text);
    this._writef32(x);
    this._writef32(y);
  }

  public lineTo(x: number, y: number): void {
    this.appendAction(ACTION.lineTo);
    this._writef32(x);
    this._writef32(y);
  }

  public moveTo(x: number, y: number): void {
    this.appendAction(ACTION.moveTo);
    this._writef32(x);
    this._writef32(y);
  }

  public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this.appendAction(ACTION.quadraticCurveTo);
    this._writef32(cpx);
    this._writef32(cpy);
    this._writef32(x);
    this._writef32(y);
  }

  public rect(x: number, y: number, w: number, h: number): void {
    this.appendAction(ACTION.rect);
    this._writef32(x);
    this._writef32(y);
    this._writef32(w);
    this._writef32(h);
  }

  public resetTransform(): void {
    this.appendAction(ACTION.resetTransform);
  }

  public restore(): void {
    this.appendAction(ACTION.restore);
  }

  public rotate(angle: number): void {
    this.appendAction(ACTION.rotate);
    this._writef32(angle);
  }

  public save(): void {
    this.appendAction(ACTION.save);
  }

  public scale(x: number, y: number): void {
    this.appendAction(ACTION.scale);
    this._writef32(x);
    this._writef32(y);
  }

  public stroke(): void {
    this.appendAction(ACTION.stroke);
  }

  public strokeRect(x: number, y: number, w: number, h: number): void {
    this.appendAction(ACTION.strokeRect);
    this._writef32(x);
    this._writef32(y);
    this._writef32(w);
    this._writef32(h);
  }

  public strokeText(text: string, x: number, y: number, maxWidth?: number): void {
    if (text.length * 2 > this._commandBuffer.byteLength - this._byteOffset - 100) {
      this.commitBuffer();
    }
    this.appendAction(ACTION.strokeText);
    this.appendText(text);
    this._writef32(x);
    this._writef32(y);
  }

  public transform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.appendAction(ACTION.transform);
    this._writef32(a);
    this._writef32(b);
    this._writef32(c);
    this._writef32(d);
    this._writef32(e);
    this._writef32(f);
  }

  public translate(x: number, y: number): void {
    this.appendAction(ACTION.translate);
    this._writef32(x);
    this._writef32(y);
  }

  private _writeBoolean(value: boolean) {
    this._writeu8(value ? 1 : 0);
  }

  private _writeu8(value: number) {
    this._dataview.setUint8(this._byteOffset, value);
    this._byteOffset += 1;
  }

  private _writeU16(value: number) {
    this._dataview.setUint16(this._byteOffset, value);
    this._byteOffset += 2;
  }

  private _writeu32(value: number) {
    this._dataview.setUint32(this._byteOffset, value);
    this._byteOffset += 4;
  }

  private _writef32(value: number) {
    this._dataview.setFloat32(this._byteOffset, value);
    this._byteOffset += 4;
  }

  private appendAction(action: ACTION) {
    if (this._byteOffset > MAX_OFFSET) {
      this.commitBuffer();
    }
    this._actionCount++;
    this._writeu8(action);
  }

  private _writeStringColor(color: string) {
    this.appendText(color);
    // const obj = new Color(color);
    // const r = obj.red();
    // const g = obj.green();
    // const b = obj.blue();
    // const a = obj.alpha();
    // this._appendToBuffer(r, VALUE_TYPE.UINT8);
    // this._appendToBuffer(g, VALUE_TYPE.UINT8);
    // this._appendToBuffer(b, VALUE_TYPE.UINT8);
    // this._appendToBuffer(a, VALUE_TYPE.FLOAT32);
  }

  private _writeColorStops(colorStops: ColorStop[]) {
    this._writeu32(colorStops.length);
    colorStops.forEach(stop => {
      this._writef32(stop.offset);
      this._writeStringColor(stop.color);
    });
  }

  private appendColor(color: string | Gradient | Pattern) {
    color = color ?? '#000';
    if (typeof color === 'string') {
      this._writeu8(ColorType.STRING_COLOR);
      this._writeStringColor(color);
    } else if (isGradient(color)) {
      if (isLinearGradient(color)) {
        const { x0, y0, x1, y1 } = color;
        this._writeu8(ColorType.LINEAR_GRADIENT);
        this._writef32(x0);
        this._writef32(y0);
        this._writef32(x1);
        this._writef32(y1);
      }

      if (isRadialGradient(color)) {
        // todo more params
        const { x0, y0, r0, x1, y1, r1 } = color;
        this._writeu8(ColorType.RADIAL_GRADIENT);
        this._writef32(x0);
        this._writef32(y0);
        this._writef32(r0);
        this._writef32(x1);
        this._writef32(y1);
        this._writef32(r1);
      }

      if (isConicGradient(color)) {
        const { startAngle, x, y } = color;
        this._writeu8(ColorType.CONIC_GRADIENT);
        this._writef32(startAngle);
        this._writef32(x);
        this._writef32(y);
      }

      this._writeColorStops(color.stops);

    } else if (isPattern(color)) {
      const { id, canvas, repeat } = color;
      this._writeu8(ColorType.PATTERN);
      const patternTransform = color.getPatternTransform();
      this._writeu32(id);
      this._images.set(id, canvas);
      this._writeu8(PatternRepeat[repeat]);
      this._writeBoolean(!!patternTransform);
      if (patternTransform) {
        const { a, b, c, d, e, f } = patternTransform;
        this._writef32(a);
        this._writef32(b);
        this._writef32(c);
        this._writef32(d);
        this._writef32(e);
        this._writef32(f);
      }
    }
  }

  private appendText(text: string) {
    const len = text.length;
    this._writeu32(len);
    for (let i = 0; i < len; i++) {
      const code = text.charCodeAt(i);
      this._writeU16(code);
    }
  }

  private resetBuffer() {
    this._commandBuffer = new ArrayBuffer(MAX_SIZE);
    this._dataview = new DataView(this._commandBuffer);
    this._byteOffset = 0;
    this._actionCount = 0;
  }

  private commitBuffer(end: boolean = false) {
    this._commandBufferList.push(this._commandBuffer);
    if (!end) {
      this.resetBuffer();
    } else {
      this._onCommit?.({
        buffers: this._commandBufferList,
        images: this._images,
      });
      this._commandBufferList = [];
      this._commandBuffer = undefined;
      this._dataview = undefined;
      this._byteOffset = 0;
      this._actionCount = 0;
    }
  }
}
