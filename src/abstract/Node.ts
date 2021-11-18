export default interface SVGNode<T = any> {
  svgTagName: string;
  svgAttr: T;
  childNodes?: SVGNode[];
}
