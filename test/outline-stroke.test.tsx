import React, { useState, createRoot, useEffect } from '../src/react';
import { Render, Group, Line, Circle, Text, Path, Rect, Polyline, Polygon, } from '../src';
import { outlineStroke } from '../src/geometry/offset/outline-stroke';
const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, { renderer: 'canvas' });
const app = createRoot(render.getRoot());
render.enableDirtyRect = false;
render.showFPS = false;

const App = () => {
  const line = new Line({
    x1: 100,
    y1: 100,
    x2: 200,
    y2: 100,
  });
  const circle = new Circle({
    cx: 150,
    cy: 180,
    radius: 50,
  });
  const rect = new Rect({
    x: 100,
    y: 300,
    width: 100,
    height: 100,
    borderRadius: 10
  })
  const polyLine = new Polyline({
    pointList: [{x: 400, y: 100}, {x: 300, y: 200}, {x: 350, y: 180}]
  });
  const polygon = new Polygon({
    pointList: [{x: 400, y: 300}, {x: 300, y: 400}, {x: 350, y: 280}]
  })
  const outlineOption: any= {
    strokeAlign: 'center',
    strokeWidth: 10,
    strokeMiterLimit: 10,
    strokeLineCap: 'butt',
    strokeLineJoin: 'miter',
    strokeCornerRadius: 0,
    viewportWidth: 1000,
    viewportHeight: 1000,
  }
  const path1 = outlineStroke(line.getPathData(), outlineOption);
  const path2 = outlineStroke(circle.getPathData(), outlineOption);
  const path3 = outlineStroke(polyLine.getPathData(), outlineOption);
  const path4 = outlineStroke(polygon.getPathData(), outlineOption);
  const path5 = outlineStroke(rect.getPathData(), outlineOption);
  return <Group>
   <Path pathData={path1} stroke="red" fill="blue" lineWidth={2} />
   <Path pathData={path2} stroke="red" fill="blue" lineWidth={2} />
   <Path pathData={path3} stroke="red" fill="blue" lineWidth={2} />
   <Path pathData={path4} stroke="red" fill="blue" lineWidth={2} />
   <Path pathData={path5} stroke="red" fill="blue" lineWidth={2} />
  </Group>
};

app.render(<App />);
