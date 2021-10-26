export { default as Render } from './render';
export { default as Element, ElementAttr } from './shapes/Element';
export { default as Group, GroupConf } from './shapes/Group';
export { default as Arc, ArcConf } from './shapes/Arc';
export { default as Circle, CircleConf } from './shapes/Circle';
export { default as Ellipse, EllipseConf } from './shapes/Ellipse';
export { default as Image, ImageConf } from './shapes/Image';
export { default as Line, LineConf } from './shapes/Line';
export { default as Path, PathConf } from './shapes/Path';
export { default as Polygon, PolygonConf } from './shapes/Polygon';
export { default as Polyline, PolylineConf } from './shapes/Polyline';
export { default as Rect, RectConf } from './shapes/Rect';
export { default as Sector, SectorConf } from './shapes/Sector';
export { default as Text, TextConf } from './shapes/Text';
export { default as RichText } from './RichText';
export { default as Shape, ShapeConf } from './shapes/Shape';
export { default as CompoundPath, CompoundPathConf } from './shapes/CompoundPath';
export { default as LinearGradient } from './color/LinearGradient';
export { default as RadialGradient } from './color/RadialGradient';
export { default as Pattern } from './color/Pattern';
export { default as PathShape } from './geometry/Path2D';
export { RefObject, createRef } from './utils/ref';
export { setCanvasCreator } from './canvas/createCanvas';
export { setImageLoader } from './utils/imageLoader';
export { registerPainter } from './painter';
export {
  setRequestAnimationFrame,
  setCancelAnimationFrame,
  getRequestAnimationFrame,
  getCancelAnimationFrame,
} from './utils/rAF';
