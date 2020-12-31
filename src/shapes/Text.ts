import Shape from './Shape'
import  {CommonAttr, } from './Element'

export interface TextAttr extends CommonAttr {
  x?: number;
  y?: number;
  text?: string;
  fontSize?: number;
  textAlign?: 'left' | 'right' | 'center';
  textBaseline?: 'top' | 'middle' | 'bottom';
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  fontStyle?: 'normal' | 'italic'| 'oblique';
}

export default class Line extends Shape<TextAttr> {

  public type = 'text';

  public brush(ctx: CanvasRenderingContext2D) {
    // todo
  }
  
}