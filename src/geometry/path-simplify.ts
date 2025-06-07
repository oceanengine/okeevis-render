/**
 * @desc simplify complex path to simple none overlap path
 */

import Path2D from "./Path2D";
import { bboxIntersect, unionBBox } from "src/utils/bbox";
import { Segment } from "./pathSegment";

export function simplifyPath(path: Path2D, fillRule: 'nonzero' | 'evenodd' = 'nonzero'): Path2D {

    return new Path2D();
}
