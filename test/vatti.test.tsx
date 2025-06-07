import React, { useState, createRoot, useEffect } from '../src/react';
import { Render, Group, Line, Circle, Text, Path, Rect, Arc, Ellipse, Polygon } from '../src';
import { scanLine } from '../src/geometry/op'
import {SegmentLine} from './react/segment'
import Path2D from '../src/geometry/Path2D';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, { renderer: 'canvas' });
const app = createRoot(render.getRoot());
render.enableDirtyRect = false;
render.showFPS = false;
const path1 = ('M338,385 L271,333 L245,226 L323,144 L481,144 L557,299 ZM329,212 L296,290 L391,290 ZM427,311 L490,459 L579,434 ZM381,177 L434,71 L462,226 Z');
const pathCross = 'M241,145 L258,348 L490,174 L549,322 Z';
const pathStar = 'M219,145 L488,161 L269,312 L356,79 L461,310 Z';
const pathselfintersect = 'M165,128 L255,203 L339,116 L427,298 L265,317 L156,307 L132,216 L237,241 L201,383 L354,377 L418,201 Z'
const pathi = 'M246,110 L326,147 L404,93 L426,197 L349,277 L259,287 L332,96 Z'
const vatti = 'M133,254 L146,179 L248,95 L439,153 L413,278 L329,180 L282,296 L223,320 L171,296 L167,268 L174,225 Z';
const App = () => {
  const path = new Path2D(path1);
  const {edges, scanBeamList, intersections} = scanLine(path);
  return <>
  <Path pathData={path} stroke="#000" fill="#eee" lineWidth={1} />
  {
    scanBeamList.map(beam => (
      <Line x1={0} y1={beam.y} x2={1000} y2={beam.y} stroke="red" lineDash={[3]} lineWidth={1}/>
    ))
  }
  {
    intersections.map(intersection => (
      <Circle cx={intersection.x} cy={intersection.y} radius={3} fill="red" />
    ))
  }
    </>
};

app.render(<App />);
