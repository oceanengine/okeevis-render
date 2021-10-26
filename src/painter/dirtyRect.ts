import { BBox, unionBBox } from '../utils/bbox';

export default function mergeDirtyRegions(mergedRects: BBox[]): BBox{
  mergedRects = mergedRects.filter(box => box.width > 0 && box.height > 0);
  return unionBBox(mergedRects);
}