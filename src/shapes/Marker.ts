import Element, { CommonAttr } from './Element';
import Shape from './Shape';

export interface MarkerAttr extends CommonAttr {
  shape?: Shape;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  orient?: string | number;
}


export default class Marker extends Element {
  public type = 'marker';

  public getDefaultAttr(): MarkerAttr {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      orient: 'auto'
    }
  }
}