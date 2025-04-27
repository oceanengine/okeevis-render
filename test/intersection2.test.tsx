import React, {
    useState,
    createRoot,
    useEffect,
  } from '../src/react';
  import { Render, Group, Line, Circle, } from '../src';
  import { lineLineIntersection, bezierIntersection, bezierLineIntersection } from '../src/geometry/intersection';
  
  const dom = document.getElementById('root') as HTMLDivElement;
  const render = new Render(dom, { renderer: 'canvas' });
  const app = createRoot(render.getRoot());
  render.showFPS = true;

  const EditDot = (props:{x:number, y:number, onMove: (pos: [number, number]) => void}) => {
    return <Circle cx={props.x} cy={props.y} radius={5} fill="red" draggable onDrag={e => props.onMove([e.x, e.y])} />
  }
  
  const App = () => {
    const [linep1, setLinep1] = useState([100, 100])
    const [linep2, setLinep2] = useState([200, 100])
    const [linep3, setLinep3] = useState([200, 200])
    const [linep4, setLinep4] = useState([300, 300])
    const intersect = lineLineIntersection(linep1[0], linep1[1], linep2[0], linep2[1], linep3[0], linep3[1], linep4[0], linep4[1])
    return <Group stroke="#000" lineWidth={1}>
      <Line x1={linep1[0]} y1={linep1[1]} x2={linep2[0]} y2={linep2[1]} stroke="red" />
      <Line x1={linep3[0]} y1={linep3[1]} x2={linep4[0]} y2={linep4[1]} stroke="red" />
      <EditDot x={linep1[0]} y={linep1[1]} onMove={setLinep1} />
      <EditDot x={linep2[0]} y={linep2[1]} onMove={setLinep2} />
      <EditDot x={linep3[0]} y={linep3[1]} onMove={setLinep3} />
      <EditDot x={linep4[0]} y={linep4[1]} onMove={setLinep4} />
      {intersect && <Circle cx={intersect.x} cy={intersect.y} radius={5} fill="blue" />}
    </Group>
  };
  
  app.render(<App />);
  