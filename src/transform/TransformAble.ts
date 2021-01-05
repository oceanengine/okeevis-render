
export interface TransformConf {
  rotation?: number;
  position?: [number, number];
  scale?: [number, number];
  origin?: [number, number];
  rotationOrigin?: [number, number];
  scaleOrigin?: [number, number];
}


export default abstract class TransformAble {
  public abstract attr: TransformConf;

  public abstract  getTransform(): mat3;
}