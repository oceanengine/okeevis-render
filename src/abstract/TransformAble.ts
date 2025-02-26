export interface TransformConf {
  rotation?: number;
  translateX?: number;
  translateY?: number;
  scaleX?: number;
  scaleY?: number;
  originX?: number | 'left' | 'center' | 'right';
  originY?: number | 'top' | 'center' | 'bottom';
  position?: [number, number];
  scale?: [number, number];
  origin?: [number, number];
  matrix?: mat3;
}
