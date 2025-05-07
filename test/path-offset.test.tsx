import React, { useState, createRoot, useEffect } from '../src/react';
import { Render, Group, Line, Circle, Text, Path } from '../src';
import Path2D from '../src/geometry/Path2D';
import { offsetSegment } from '../src/geometry/offset/offset-segment';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, { renderer: 'canvas' });
const app = createRoot(render.getRoot());
render.enableDirtyRect = false;
render.showFPS = true;

const EditDot = (props: { x: number; y: number; onMove: (pos: [number, number]) => void }) => {
  return (
    <Circle
      cx={props.x}
      cy={props.y}
      radius={5}
      fill="red"
      lineWidth={0}
      draggable
      onDrag={e => props.onMove([e.x, e.y])}
    />
  );
};

const App = () => {
  const [p1, setp1] = useState([100, 100]);
  const [p2, setp2] = useState([1141, 348]);
  const [p3, setp3] = useState([1027, 96]);
  const [p4, setp4] = useState([84, 342]);
  const path = new Path2D();
  path.moveTo(p1[0], p1[1]);
  path.bezierCurveTo(p2[0], p2[1], p3[0], p3[1], p4[0], p4[1]);
  const offsetCurveList = offsetSegment(
    { type: 'bezier', params: [...p1, ...p2, ...p3, ...p4] },
    20,
  );
  const offsetCurveList2 = offsetSegment(
    { type: 'bezier', params: [...p1, ...p2, ...p3, ...p4] },
    -20,
  )
  const path2 = new Path2D();
  offsetCurveList.forEach(p => {
    const offsetPath = p.params;
    path2.moveTo(offsetPath[0], offsetPath[1]);
    for (let i = 2; i < offsetPath.length; i += 6) {
      path2.bezierCurveTo(
        offsetPath[i],
        offsetPath[i + 1],
        offsetPath[i + 2],
        offsetPath[i + 3],
        offsetPath[i + 4],
        offsetPath[i + 5],
      );
    }
  });
  const path3 = new Path2D();
  offsetCurveList2.forEach(p => {
    const offsetPath = p.params;
    path3.moveTo(offsetPath[0], offsetPath[1]);
    for (let i = 2; i < offsetPath.length; i += 6) {
      path3.bezierCurveTo(
        offsetPath[i],
        offsetPath[i + 1],
        offsetPath[i + 2],
        offsetPath[i + 3],
        offsetPath[i + 4],
        offsetPath[i + 5],
      );
    }
  });

  return (
    <>
      <Path pathData={path} stroke="none" lineWidth={40} />
      <Path pathData={path} stroke="#fff" lineWidth={2} />
      <EditDot x={p1[0]} y={p1[1]} onMove={setp1} />
      <EditDot x={p2[0]} y={p2[1]} onMove={setp2} />
      <EditDot x={p3[0]} y={p3[1]} onMove={setp3} />
      <EditDot x={p4[0]} y={p4[1]} onMove={setp4} />
      <Path pathData={path2} stroke="red" lineWidth={2} />
      <Path pathData={path3} stroke="blue" lineWidth={2} />
      <Group stroke={'none'} fill="#000" pointerEvents="none">
        <Text x={p1[0]} y={p1[1]} text={'p1' + `(${p1[0]},${p1[1]})`} />
        <Text x={p2[0]} y={p2[1]} text={'p2' + `(${p2[0]},${p2[1]})`} />
        <Text x={p3[0]} y={p3[1]} text={'p3' + `(${p3[0]},${p3[1]})`} />
        <Text x={p4[0]} y={p4[1]} text={'p4' + `(${p4[0]},${p4[1]})`} />
      </Group>
      {offsetCurveList.map((p, index) => {
        return (
          <Group>
            <Circle cx={p.params[0]} cy={p.params[1]} radius={2} fill="blue" />
            <Circle cx={p.params[6]} cy={p.params[7]} radius={2} fill="blue" />
          </Group>
          
        );
      })}
    </>
  );
};

app.render(<App />);
