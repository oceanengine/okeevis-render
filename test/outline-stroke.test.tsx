import React, { useState, createRoot, useEffect } from '../src/react';
import {
  Render,
  Group,
  Line,
  Circle,
  Text,
  Path,
  Rect,
  Polyline,
  Polygon,
  Sector,
  Arc,
} from '../src';
import { outlineStroke } from '../src/geometry/offset/outline-stroke';
const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, { renderer: 'canvas' });
const app = createRoot(render.getRoot());
render.enableDirtyRect = false;
render.showFPS = false;

const App = () => {
  const [lineJoin, setLineJoin] = useState('miter');
  const [lineCap, setLineCap] = useState<CanvasLineCap>('round');
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
    borderRadius: 0,
  });
  const polyLine = new Polyline({
    pointList: [
      { x: 400, y: 100 },
      { x: 300, y: 200 },
      { x: 350, y: 180 },
      {
        x: 300,
        y: 100,
      },
    ],
  });

  const polygon = new Polygon({
    pointList: [
      { x: 380, y: 300 },
      { x: 370, y: 400 },
      { x: 360, y: 280 },
    ],
  });

  const sector = new Sector({
    cx: 600,
    cy: 150,
    radius: 80,
    start: 0,
    end: Math.PI / 2,
  });

  const arc = new Arc({
    cx: 600,
    cy: 350,
    radius: 80,
    start: 0,
    end: Math.PI / 2,
  });

  const outlineOption: any = {
    strokeAlign: 'center',
    strokeWidth: 10,
    strokeMiterLimit: 10,
    strokeLineCap: lineCap,
    strokeLineJoin: lineJoin,
    strokeCornerRadius: 0,
    viewportWidth: 1000,
    viewportHeight: 1000,
  };
  const path1 = outlineStroke(line.getPathData(), outlineOption);
  const path2 = outlineStroke(circle.getPathData(), outlineOption);
  const path3 = outlineStroke(polyLine.getPathData(), outlineOption);
  const path4 = outlineStroke(polygon.getPathData(), outlineOption);
  const path5 = outlineStroke(rect.getPathData(), outlineOption);
  const path6 = outlineStroke(sector.getPathData(), outlineOption);
  const path7 = outlineStroke(arc.getPathData(), outlineOption);

  useEffect(() => {
    let count = 0;
    render.on('click', () => {
      count++;
      const index = count % 3;
      if (index === 0) {
        setLineJoin('round');
        setLineCap('round');
      } else if (index === 1) {
        setLineJoin('bevel');
        setLineCap('square');
      } else if (index === 2) {
        setLineJoin('miter');
        setLineCap('butt');
      }
    });
  }, []);
  return (
    <Group draggable lineJoin={outlineOption.strokeLineJoin} lineCap={lineCap} scaleX={1.5} scaleY={1.5}>
      <Group fill="none" stroke="#000" opacity={0.6} lineWidth={outlineOption.strokeWidth}>
        {line}
        {circle}
        {rect}
        {polyLine}
        {polygon}
        {sector}
        {arc}
      </Group>
      <Path pathData={path1} stroke="red" fill="none" lineWidth={2} />
      <Path pathData={path2} stroke="red" fill="none" lineWidth={2} />
      <Path pathData={path3} stroke="red" fill="none" lineWidth={2} />
      <Path pathData={path4} stroke="red" fill="none" lineWidth={2} />
      <Path pathData={path5} stroke="red" fill="none" lineWidth={2} />
      <Path pathData={path6} stroke="red" fill="none" lineWidth={2} />
      <Path pathData={path7} stroke="red" fill="none" lineWidth={2} />
    </Group>
  );
};

app.render(<App />);
