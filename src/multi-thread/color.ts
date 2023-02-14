let imageId: number = 1;

const imageStorage: Map<HTMLImageElement, { id: number; canvas: OffscreenCanvas }> = new Map();

export function loadImage(image: HTMLImageElement): { id: number; canvas: OffscreenCanvas } {
  if (imageStorage.has(image)) {
    return imageStorage.get(image);
  }
  const id = imageId++;
  const canvas = new OffscreenCanvas(image.width, image.height);
  canvas.getContext('2d').drawImage(
    image,
    0,
    0,
    image.width,
    image.height,
  );
  imageStorage.set(image, { id, canvas });
  return imageStorage.get(image);
}

export function isGradient(value: unknown): value is Gradient {
  return (value as Gradient).$$isGradient;
}

export function isLinearGradient(value: unknown): value is LinearGradient {
  return (value as LinearGradient).$$isLinearGradient;
}

export function isRadialGradient(value: unknown): value is RadialGradient {
  return (value as RadialGradient).$$isRadialGradient;
}

export function isConicGradient(value: unknown): value is ConicGradient {
  return (value as ConicGradient).$$isConicGradient;
}

export function isPattern(value: unknown): value is Pattern {
  return (value as Pattern).$$isPattern;
}

export interface ColorStop {
  offset: number;
  color: string;
}

export abstract class Gradient {
  public $$isGradient = true;

  public stops: ColorStop[];

  constructor() {
    this.stops = [];
  }

  public addColorStop(offset: number, color: string) {
    this.stops.push({ offset, color });
  }
}

export class LinearGradient extends Gradient {
  public $$isLinearGradient = true;
  public x0: number;
  public y0: number;
  public x1: number;
  public y1: number;
  public constructor(x0: number, y0: number, x1: number, y1: number) {
    super();
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
  }
}

export class RadialGradient extends Gradient {
  public $$isRadialGradient = true;
  public x0: number;
  public y0: number;
  public r0: number;
  public x1: number;
  public y1: number;
  public r1: number;
  public constructor(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) {
    super();
    this.x0 = x0;
    this.y0 = y0;
    this.r0 = r0;
    this.x1 = x1;
    this.y1 = y1;
    this.r1 = r1;
  }
}

export class ConicGradient extends Gradient {
  public $$isConicGradient = true;
  public startAngle: number;
  public x: number;
  public y: number;
  public constructor(startAngle: number, x: number, y: number) {
    super();
    this.startAngle = startAngle;
    this.x = x;
    this.y = y;
  }
}

export type PatternRepeat =  'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
export class Pattern {
  public $$isPattern: boolean = true;

  public id: number;

  private _transform: DOMMatrix | undefined;

  public repeat:  PatternRepeat;

  public canvas: OffscreenCanvas;

  constructor(image: HTMLImageElement, repeat: PatternRepeat = 'repeat') {
    const { id, canvas } = loadImage(image);
    this.repeat = repeat;
    this.id = id;
    this.canvas = canvas;
  }

  public setTransform(transform?: DOMMatrix): void {
    this._transform = transform;
  }

  public getPatternTransform(): DOMMatrix | undefined {
    return this._transform;
  }
}
