import React, { useState, createRoot, useEffect } from '../src/react';
import { Render, Group, Line, Circle, Text, Path, Rect, Arc, Ellipse } from '../src';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, { renderer: 'canvas' });
const app = createRoot(render.getRoot());
render.enableDirtyRect = false;
render.showFPS = false;

const App = () => {
  const arc = new Path({
    stroke: 'red',
    lineWidth:4,
    brush: ctx => {
      ctx.arc(600, 150, 75, 5.654866776461628, 1, true);
    }
  });

  const ellipsis = new Path({
    brush: ctx => {
      ctx.ellipse(300, 150, 75, 50, 0, Math.PI, 0, true);
    },
    stroke: 'red',
    lineWidth: 4,
    fill: 'none'
  })
  const curve1 = arc.getPathData().toCurve();
  const curve2 = ellipsis.getPathData().toCurve();
  return <>
    {arc}
    {ellipsis}
    <Path pathData={curve1} stroke="#000" lineWidth={1} />
    <Path pathData={curve2} stroke="#000" lineWidth={1} />
  </>
};

app.render(<App />);
