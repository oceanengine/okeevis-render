import Element, {CommonAttr, } from './Element'

export default  class Shape<T extends CommonAttr = any> extends Element<T> {
  public brush(ctx: CanvasRenderingContext2D) {
    ctx
  }
}