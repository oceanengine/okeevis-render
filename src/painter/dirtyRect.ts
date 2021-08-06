import { BBox, unionBBox } from '../utils/bbox';

/**  https://idom.me/articles/841.html
 * 1. 如果两个矩形合并后总面积小于两个矩形各自面积之和,则允许合并, 并且优先合并相交面积最大的两个矩形
 * 2. 合并到最后,若规则1已经不满足,但是剩余矩形总数量大于3,则强制继续合并.并优先合并面积增加量最小的两个矩形.
 * 3. 脏区数量建议不超过3个, 超过则强制合并
 * */
export default function mergeDirtyRegions(mergedRects: BBox[]): BBox[] {
  mergedRects = mergedRects.filter(box => box.width > 0 && box.height > 0);
  return [unionBBox(mergedRects)];
}

/**
 * 直接操作BBox数组，没有返回值
 * */
function unionRect(rects: BBox[]): BBox[] {
  if (rects.length <= 3) {
    return;
  }

  while (rects.length > 3) {
    let ret: number = Number.MAX_VALUE;
    let a: number;
    let b: number;
    let dis: number;
    const n: number = rects.length;
    // 二重循环，可能还要有优化的地方
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        dis = increaseArea(rects[i], rects[j]);
        if (dis < ret) {
          ret = dis;
          a = i;
          b = j;
        }
      }
    }
    rects.push(mergeRect(rects[a], rects[b]));
    if (a > b) {
      // 必须先删除下标比较大的元素，要不然删除第二个元素的时候会出问题
      rects.splice(a, 1);
      rects.splice(b, 1);
    } else {
      rects.splice(b, 1);
      rects.splice(a, 1);
    }
  }
}

function increaseArea(rect1: BBox, rect2: BBox): number {
  const r1Area = rect1.width * rect1.height;
  const r21Area = rect2.width * rect2.height;
  // 矩形1的四个点
  const p1_x = rect1.x;
  const p1_y = rect1.y;
  const p2_x = p1_x + rect1.width;
  const p2_y = p1_y + rect1.height;

  // 矩形2的四个点
  const p3_x = rect2.x;
  const p3_y = rect2.y;
  const p4_x = p3_x + rect2.width;
  const p4_y = p3_y + rect2.height;

  // 外边大矩形的四个点
  const totalLeftX = Math.min(p1_x, p3_x);
  const totalLeftY = Math.min(p1_y, p3_y);
  const totalRightX = Math.max(p2_x, p4_x);
  const totalRightY = Math.max(p2_y, p4_y);

  const totalArea = (totalRightY - totalLeftY) * (totalRightX - totalLeftX);
  return totalArea - (r1Area + r21Area);
}

function mergeRect(rect1: BBox, rect2: BBox): BBox {
  // 矩形1的四个点
  const p1_x = rect1.x;
  const p1_y = rect1.y;
  const p2_x = p1_x + rect1.width;
  const p2_y = p1_y + rect1.height;

  // 矩形2的四个点
  const p3_x = rect2.x;
  const p3_y = rect2.y;
  const p4_x = p3_x + rect2.width;
  const p4_y = p3_y + rect2.height;

  // 外边大矩形的四个点
  const totalLeftX = Math.min(p1_x, p3_x);
  const totalLeftY = Math.min(p1_y, p3_y);
  const totalRightX = Math.max(p2_x, p4_x);
  const totalRightY = Math.max(p2_y, p4_y);

  // 返回外面的大矩形
  return {
    x: totalLeftX,
    y: totalLeftY,
    width: totalRightX - totalLeftX,
    height: totalRightY - totalLeftY,
  };
}
