import { BBox, unionBBox } from '../utils/bbox';

export default function mergeDirtyRegions(mergedRects: BBox[], dpr: number): BBox {
  mergedRects = mergedRects.filter(box => box.width > 0 && box.height > 0);
  const bbox = unionBBox(mergedRects);
  let { x, y, width, height } = bbox;
  const minx = Math.floor(x * dpr);
  const maxx = Math.ceil((x + width) * dpr);
  const miny = Math.floor(y *  dpr);
  const maxy = Math.ceil((y + height) * dpr)
  bbox.x = minx / dpr;
  bbox.y = miny / dpr;
  bbox.width = (maxx - minx) / dpr;
  bbox.height = (maxy - miny) / dpr;
  return bbox;
}