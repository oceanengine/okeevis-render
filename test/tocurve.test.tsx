import React, { useState, createRoot, useEffect } from '../src/react';
import { Render, Group, Line, Circle, Text, Path, Rect, Arc } from '../src';

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
      ctx.arc(600, 150, 75,  Math.PI/ 2,0, true);
    }
  });
  const curve = arc.getPathData().toCurve();
  return <>
    {arc}
    <Path pathData={curve} stroke="#000" lineWidth={1} />
  </>
};

app.render(<App />);
