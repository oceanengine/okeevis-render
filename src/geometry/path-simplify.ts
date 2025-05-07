/**
 * @desc simplify complex path to simple none overlap path
 */

import Path2D from "./Path2D";
import { bboxIntersect, unionBBox } from "src/utils/bbox";
import { Segment } from "./pathSegment";

export function simplifyPath(path: Path2D, fillRule: 'nonzero' | 'evenodd' = 'nonzero'): Path2D {

    return new Path2D();
}

const enum PathRelation {
    Contain, // path1 contains path2
    Contained, // path1 is contained by path2
    CommonSide, // path1 and path2 have common side
    Separate, // path1 and path2 are separate
}
