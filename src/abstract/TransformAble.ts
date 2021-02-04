
export interface TransformConf {
  rotation?: number;
  translateX?: number;
  translateY?: number;
  scaleX?: number;
  scaleY?: number;
  originX?: number;
  originY?: number;
  position?: [number, number];
  scale?: [number, number];
  origin?: [number, number];
  matrix?: mat3;
}

// export default abstract class TransformAble {
//   public abstract attr: TransformConf;

//   public abstract  getTransform(): mat3;

//   public abstract getBaseTransform(): mat3;

//   public abstract resetTransform(): void;

//   // todo 考虑换成标准的transform
//   public abstract setBaseTransform(transform: mat3): void;

//   public abstract translate(x: number, y: number): void;

//   public abstract scale(sx: number, sy: number): void;

//   public abstract rotate(rad: number): void;
  
// }