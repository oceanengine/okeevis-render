import React, { useState, createRoot, useEffect } from '../src/react';
import { Render, Group, Line, Circle, Text, Path, Rect } from '../src';
import Path2D from '../src/geometry/Path2D';
import { offsetSegment } from '../src/geometry/offset/offset-segment';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, { renderer: 'canvas' });
const app = createRoot(render.getRoot());
render.enableDirtyRect = false;
render.showFPS = false;

const App = () => {
  const [pointsArray, setPointsArray] = useState<[number, number][][]>([]);
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  return (
    <Group>
      <Rect
        width={render.getWidth()}
        height={render.getHeight()}
        fill="#fff"
        onMouseDown={e => {
          if (!isDrawing) {
            return;
          }
          const { x, y } = e;
          currentPoints.push([x, y]);
          setPointsArray(pointsArray.slice());
        }}
      />
      <Text
        fill="#000"
        x={10}
        y={20}
        text="开始路径"
        onClick={() => {
          const arr: [number, number][] = [];
          setIsDrawing(true);
          setCurrentPoints(arr);
          pointsArray.push(arr);
          setPointsArray(pointsArray.slice());
        }}
      />
      <Text
        fill="#000"
        x={80}
        y={20}
        text="结束路径"
        onClick={() => {
          setIsDrawing(false);
        }}
      />
      <Text
        fill="#000"
        x={150}
        y={20}
        text="清除路径"
        onClick={() => {
          setPointsArray([]);
          setIsDrawing(false);
        }}
      />
      <Path
       pointerEvents='none'
        brush={ctx => {
          pointsArray.forEach(points => {
            points.forEach((point, index) => {
              if (index === 0) {
                ctx.moveTo(point[0], point[1]);
              } else {
                ctx.lineTo(point[0], point[1]);
              }
              if (index === points.length - 1) {
                ctx.closePath();
              }
            });
          });
        }}
        stroke="#000"
        fill="#eee"
        lineWidth={1}
      />
    </Group>
  );
};

app.render(<App />);
