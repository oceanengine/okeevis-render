import Element, {CommonAttr, } from './Element'

import {ArcConf, } from './Arc';
import {CircleConf, } from './Circle';
import {ImageConf, } from './Image';
import {LineConf, } from './Line';
import {PathConf, } from './Path';
import {PolygonConf, } from './Polygon';
import {PolylineConf, } from './Polyline';
import {RectConf, } from './Rect';
import {SectorConf, } from './Sector';
import {TextConf, } from './Text';
import {EllipseConf, } from './Ellipse';
import {CompoundPathConf, } from './CompoundPath';


export type ShapeConf = ArcConf & CircleConf & ImageConf & LineConf & PathConf & PolylineConf & PolygonConf & RectConf & SectorConf & TextConf & CompoundPathConf & EllipseConf;

export default  class Shape<T extends CommonAttr = ShapeConf> extends Element<T> {
  public brush(ctx: CanvasRenderingContext2D) {
    ctx
  }  
}