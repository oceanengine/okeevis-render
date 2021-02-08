import { BBox, unionBBox, bboxIntersect } from '../utils/bbox';
import * as lodash from '../utils/lodash';

/**  https://idom.me/articles/841.html
 * 1. 如果两个矩形合并后总面积小于两个矩形各自面积之和,则允许合并, 并且优先合并相交面积最大的两个矩形
 * 2. 合并到最后,若规则1已经不满足,但是剩余矩形总数量大于3,则强制继续合并.并优先合并面积增加量最小的两个矩形.
 * 3. 脏区数量建议不超过3个, 超过则强制合并
 * */

export default function mergeDirtyRegions(mergedRects: BBox[]): BBox[] {
  return [unionBBox(mergedRects)];
}
