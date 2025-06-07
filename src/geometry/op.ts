// vattie clippping
// implement by https://github.com/dpuyda/triclipper/blob/master/docs/how_it_works.md#local-minimums

import { flatten } from 'lodash-es';
import Path2D, { PathIntersection } from './Path2D';
import { getPointAtSegment, Segment } from './pathSegment';
import { segmentIntersection } from './intersection/segment-intersection';

const enum PathOp {
  DIFFERENCE,
  INTERSECTION,
  REVERSED_DIFFERENCE,
  UNION,
  XOR,
}

export interface Vertex {
  x: number;
  y: number;
  prev: Vertex;
  next: Vertex;
}
export interface Edge {
  start: Vertex;
  end: Vertex;
  segment: Segment;
  prev: Edge;
  next: Edge;
  isLeft: boolean;
  topLeftSide?: 'outer' | 'inner';
  bottomRightSide?: 'outer' | 'inner';
  id: number;
  intersections: Array<{
    t: number;
    segment: Segment;
  }>;
}
export interface LocalMinimum {
  rootVertex: Vertex;
  leftBounds: Vertex[];
  rightBounds: Vertex[];
}

function compareVertex(a: Vertex, b: Vertex) {
  if (a.y === b.y) {
    return a.x - b.x;
  }
  return b.y - a.y;
}

function getIndex(total: number, index: number): number {
  if (index < 0) {
    return total + index;
  }
  if (index >= total) {
    return index - total;
  }
  return index;
}
let count = 0;

export function getPathVertexList(path: Path2D): [Vertex[][], Edge[]] {
  const pathList = path.getSubpaths();
  const edges: Edge[] = [];
  const vertexListArray = pathList.map(path => {
    const segments = path.getSegments();
    const points = segments.map(segment => getPointAtSegment(0, segment));
    const res = points.map((point, index) => {
      return {
        x: point.x,
        y: point.y,
        prev: undefined,
        next: undefined,
      } as Partial<Vertex>;
    }) as Vertex[];
    res.forEach((vertex, index) => {
      vertex.prev = res[getIndex(res.length, index - 1)] as Vertex;
      vertex.next = res[getIndex(res.length, index + 1)] as Vertex;
      const isReversed = compareVertex(vertex as Vertex, vertex.next) > 0;
      const [start, end] = isReversed ? [vertex.next, vertex] : [vertex, vertex.next];
      const edge = {
        id: index,
        start,
        end,
        segment: segments[index],
        isLeft: isReversed,
        intersections: [] as any,
      };
      edges.push(edge as Edge);
    });
    return res as any;
  });
  return [vertexListArray, edges];
}

export function getLocalMinimumList(
  vertexList: Vertex[],
  res: LocalMinimum[] = [],
): LocalMinimum[] {
  if (!vertexList.length) {
    return res;
  }
  let minVertexIndex = 0;
  for (let i = 0; i < vertexList.length; i++) {
    if (compareVertex(vertexList[i], vertexList[minVertexIndex]) < 0) {
      minVertexIndex = i;
    }
  }
  let rootVertex = vertexList[minVertexIndex];
  let prev = rootVertex.prev;
  let next = rootVertex.next;
  const prevSide = compareVertex(rootVertex, prev);
  const nextSide = compareVertex(rootVertex, next);

  while (compareVertex(prev, prev.prev) * prevSide > 0) {
    prev = prev.prev;
  }

  while (compareVertex(next, next.next) * nextSide > 0) {
    next = next.next;
  }

  res.push({
    rootVertex,
    leftBounds: [],
    rightBounds: [],
  });

  while (prev !== next) {
    while (compareVertex(prev, prev.prev) * prevSide < 0) {
      prev = prev.prev;
    }
    res.push({
      rootVertex: prev,
      leftBounds: [],
      rightBounds: [],
    });

    while (compareVertex(prev, prev.prev) * prevSide > 0) {
      prev = prev.prev;
    }
  }

  return res;
}

function findIntersections(
  edges: Edge[],
  out: PathIntersection[],
  intersected: Record<string, boolean>,
) {
  if (edges.length <= 1) {
    return;
  }
  for (let i = 0; i < edges.length; i++) {
    for (let j = 0; j < edges.length; j++) {
      const key = [edges[i].id, edges[j].id].sort().join('-');
      if (i === j || intersected[key]) {
        continue;
      }
      if (
        edges[i].start === edges[j].start ||
        edges[i].end === edges[j].end ||
        edges[i].start === edges[j].end ||
        edges[i].end === edges[j].start
      ) {
        continue;
      }
      intersected[key] = true;
      segmentIntersection(edges[i].segment, edges[j].segment, out);
      count++;
    }
  }
}

export function scanLine(path: Path2D) {
  const [vertexListArray, edges] = getPathVertexList(path);
  const intersections: PathIntersection[] = [];
  const intersected: Record<string, boolean> = {};

  const localMinimumListArray = vertexListArray.map(vertexList => getLocalMinimumList(vertexList));

  const scanBeamList = flatten(localMinimumListArray)
    .map(localMinimum => {
      return localMinimum.rootVertex;
    })
    .sort(compareVertex);

  let remainEdges = edges;
  let yBottom = scanBeamList[0].y;
  while (scanBeamList.length > 0) {
    const activeEdges: Edge[] = [];
    const horizontalEdges: Edge[] = [];
    for (let i = 0; i < remainEdges.length; i++) {
      const edge = remainEdges[i];
      if (edge.start.y === yBottom && edge.end.y === yBottom) {
        horizontalEdges.push(edge);
      } else {
        if (!(edge.start.y < yBottom || edge.end.y > yBottom)) {
          activeEdges.push(edge);
        }
      }
    }
    console.log(horizontalEdges);
    remainEdges = remainEdges.filter(edge => edge.end.y < yBottom);
    const topActiveEdges = activeEdges.filter(
      edge => edge.start.y <= yBottom || edge.end.y < yBottom,
    );
    const bottomActiveEdges = activeEdges.filter(
      edge => edge.end.y >= yBottom || edge.start.y > yBottom,
    );
    activeEdges.forEach(edge => {
      scanBeamList.push(edge.end);
    });
    scanBeamList.sort(compareVertex);
    const nextY = scanBeamList.find(vertex => vertex.y < yBottom)?.y;
    if (nextY) {
      findIntersections(topActiveEdges, intersections, intersected);
      findIntersections(bottomActiveEdges, intersections, intersected);
    }
    if (remainEdges.length === 0) {
      break;
    }

    yBottom = nextY;
  }
  console.log(edges.length, count);
  return { edges, scanBeamList, intersections };
}
