import Element, {CommonAttr, } from './Element'

export default  class Shape<T extends CommonAttr = CommonAttr> extends Element<T> {

  public brush(ctx: CanvasRenderingContext2D) {
    ctx
  }
}