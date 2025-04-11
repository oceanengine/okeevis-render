
import { interpolateNumber } from "../interpolate";

interface OffsetItem {
    offset?: number;
}

export function processOffsetList(colorStops: OffsetItem[]) {
    let begin: number = undefined;
  let end: number = undefined;
  const unsetOffsets: OffsetItem[] = [];
  for (let i = 0; i < colorStops.length; i++) {
    const { offset } = colorStops[i];
    if (offset === undefined) {
      unsetOffsets.push(colorStops[i]);
    } else {
      if (!unsetOffsets.length) {
        begin = offset;
      } else {
        end = offset;
        setUnsetOffsets(unsetOffsets, begin, end);
        unsetOffsets.length = 0;
        begin = offset;
        end = undefined;
      }
    }
    if (unsetOffsets.length && i === colorStops.length - 1) {
      setUnsetOffsets(unsetOffsets, begin, end);
    }
  }

  function setUnsetOffsets(unsetStops: OffsetItem[], start: number, end: number) {
    if (start === undefined) {
      unsetStops[0].offset = 0;
      start = 0;
    }

    if (end === undefined) {
      unsetStops[unsetStops.length - 1].offset = 1;
      end = 1;
    }

    unsetStops = unsetStops.filter(item => item.offset === undefined);

    unsetStops.forEach((item, index) => {
      item.offset = interpolateNumber(start, end, (index + 1) / (unsetStops.length + 1));
    });
  }
}