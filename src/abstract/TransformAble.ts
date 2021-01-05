
export interface TransformConf {
  rotation?: number;
  position?: [number, number];
  scale?: [number, number];
  origin?: [number, number];
}


export default abstract class TransformAble {
  public abstract attr: TransformConf;

  public abstract  getTransform(): mat3;

  public abstract resetTransform(): void;

  public abstract translate(x: number, y: number): void;

  public abstract scale(sx: number, sy: number): void;

  public abstract rotate(rad: number): void;
  
}