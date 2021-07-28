/**
 * @desc flex layout
 */
 import { BBox } from '../utils/bbox';
 import * as lodash from '../utils/lodash';

type BoxAlign = 'start' | 'center' | 'end';

export function getAlignPosition(
  start: number,
  end: number,
  size: number,
  align: BoxAlign,
): number {
  const positionMap: Record<BoxAlign, number> = {
    start,
    end: end - size,
    center: (start + end) / 2 - size / 2,
  };
  return positionMap[align];
}
export function flexLayout(
  contentBox: BBox,
  boxList: BBox[],
  type: 'hbox' | 'vbox',
  propsAlign: BoxAlign = 'start',
  propsPack: BoxAlign = 'start',
) {
  const left = contentBox.x;
  const right = contentBox.x + contentBox.width;
  const top = contentBox.y;
  const bottom = contentBox.y + contentBox.height;

  function boxAlign(axis: 'x' | 'y', align: BoxAlign) {
    boxList.forEach(box => {
      if (axis === 'x') {
        box.x = getAlignPosition(left, right, box.width, align);
      } else if (axis === 'y') {
        box.y = getAlignPosition(top, bottom, box.height, align);
      }
    });
  }

  function boxPack(axis: 'x' | 'y', pack: BoxAlign) {
    const contentSize =
      axis === 'x'
        ? lodash.sum(boxList.map(box => box.width))
        : lodash.sum(boxList.map(box => box.height));
    const start =
      axis === 'x'
        ? getAlignPosition(left, right, contentSize, pack)
        : getAlignPosition(top, bottom, contentSize, pack);
    boxList.reduce((prev, current) => {
      if (axis === 'x') {
        current.x = prev;
        return prev + current.width;
      }
      if (axis === 'y') {
        current.y = prev;
        return prev + current.height;
      }
    }, start);
  }

  if (type === 'hbox') {
    boxPack('x', propsPack);
    boxAlign('y', propsAlign);
  } else if (type === 'vbox') {
    boxPack('y', propsPack);
    boxAlign('x', propsAlign);
  }
}

export type PaddingOption = number | number[];

export interface Padding {
  paddingTop: number;
  paddingLeft: number;
  paddingRight: number;
  paddingBottom: number;
}

export function getPadding(padding: PaddingOption): Padding {
  let paddingTop: number = 0;
  let paddingLeft: number = 0;
  let paddingRight: number = 0;
  let paddingBottom: number = 0;
  if (lodash.isNumber(padding)) {
    paddingTop = paddingLeft = paddingRight = paddingBottom = padding;
  } else if (lodash.isArray(padding)) {
    if (padding.length === 1) {
      paddingTop = paddingLeft = paddingRight = paddingBottom = padding[0];
    } else if (padding.length === 2) {
      paddingTop = paddingBottom = padding[0];
      paddingLeft = paddingRight = padding[1];
    } else if (padding.length === 3) {
      paddingTop = padding[0];
      paddingRight = paddingLeft = padding[1];
      paddingBottom = padding[2];
    } else if (padding.length === 4) {
      paddingTop = padding[0];
      paddingRight = padding[1];
      paddingBottom = padding[2];
      paddingLeft = padding[3];
    }
  }
  return {
    paddingTop,
    paddingLeft,
    paddingRight,
    paddingBottom,
  };
}