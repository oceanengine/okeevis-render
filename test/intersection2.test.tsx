import React, {
    useState,
    createRoot,
    useEffect,
  } from '../src/react';
  import { Render, Group, Line, Circle, Text, Path, } from '../src';
  import { lineLineIntersection, bezierIntersection, bezierLineIntersection } from '../src/geometry/intersection';
  
  const dom = document.getElementById('root') as HTMLDivElement;
  const render = new Render(dom, { renderer: 'canvas' });
  const app = createRoot(render.getRoot())
  render.enableDirtyRect = false;
  render.showFPS = true;

  const EditDot = (props:{x:number, y:number, onMove: (pos: [number, number]) => void}) => {
    return <Circle cx={props.x} cy={props.y} radius={5} fill="red" draggable onDrag={e => props.onMove([e.x, e.y])} />
  }
  
  const App = () => {
    const [linep1, setLinep1] = useState([100, 100])
    const [linep2, setLinep2] = useState([200, 100])
    const [linep3, setLinep3] = useState([200, 200])
    const [linep4, setLinep4] = useState([300, 300])

    const [bezierp1, setBezierp1] = useState([100, 100])
    const [bezierp2, setBezierp2] = useState([100, 200])
    const [bezierp3, setBezierp3] = useState([200, 200])
    const [bezierp4, setBezierp4] = useState([317, 72])

    const [bezierp5, setBezierp5] = useState([220,55])
    const [bezierp6, setBezierp6] = useState([300, 200])
    const [bezierp7, setBezierp7] = useState([400, 200])
    const [bezierp8, setBezierp8] = useState([400, 100])

    const bezierIntersect = bezierIntersection([...bezierp1, ...bezierp2, ...bezierp3, ...bezierp4], [...bezierp5, ...bezierp6, ...bezierp7, ...bezierp8]);
    const intersect = lineLineIntersection(linep1[0], linep1[1], linep2[0], linep2[1], linep3[0], linep3[1], linep4[0], linep4[1])
    return <Group stroke="#000" lineWidth={1}>
      {/* <Line x1={linep1[0]} y1={linep1[1]} x2={linep2[0]} y2={linep2[1]} stroke="red" />
      <Line x1={linep3[0]} y1={linep3[1]} x2={linep4[0]} y2={linep4[1]} stroke="red" />
      <EditDot x={linep1[0]} y={linep1[1]} onMove={setLinep1} />
      <EditDot x={linep2[0]} y={linep2[1]} onMove={setLinep2} />
      <EditDot x={linep3[0]} y={linep3[1]} onMove={setLinep3} />
      <EditDot x={linep4[0]} y={linep4[1]} onMove={setLinep4} />
      <Text x={linep1[0]} y={linep1[1] - 10}>{linep1.join(', ')}</Text>
      <Text x={linep2[0]} y={linep2[1] - 10}>{linep2.join(', ')}</Text>
      <Text x={linep3[0]} y={linep3[1] - 10}>{linep3.join(', ')}</Text>
      <Text x={linep4[0]} y={linep4[1] - 10}>{linep4.join(', ')}</Text>
      {intersect && <Circle cx={intersect.x} cy={intersect.y} radius={5} fill="blue" />} */}
      {Path.fromSvgPath(`M${bezierp1.join(' ')} C${bezierp2.join(' ')} ${bezierp3.join(' ')} ${bezierp4.join(' ')}`)}
      {Path.fromSvgPath(`M${bezierp5.join(' ')} C${bezierp6.join(' ')} ${bezierp7.join(' ')} ${bezierp8.join(' ')}`)}
      <EditDot x={bezierp1[0]} y={bezierp1[1]} onMove={setBezierp1} />
      <EditDot x={bezierp2[0]} y={bezierp2[1]} onMove={setBezierp2} />
      <EditDot x={bezierp3[0]} y={bezierp3[1]} onMove={setBezierp3} />
      <EditDot x={bezierp4[0]} y={bezierp4[1]} onMove={setBezierp4} />
      <EditDot x={bezierp5[0]} y={bezierp5[1]} onMove={setBezierp5} />
      <EditDot x={bezierp6[0]} y={bezierp6[1]} onMove={setBezierp6} />
      <EditDot x={bezierp7[0]} y={bezierp7[1]} onMove={setBezierp7} />
      <EditDot x={bezierp8[0]} y={bezierp8[1]} onMove={setBezierp8} />
      {bezierIntersect.map(({x, y}) => <Circle cx={x} cy={y} radius={5} fill="blue" pointerEvents='none' />)}
      <Group stroke="none" fill="#000" pointerEvents='none'>
        <Text x={bezierp1[0]} y={bezierp1[1] - 10}>{'p1' + bezierp1.join(', ')}</Text>
        <Text x={bezierp2[0]} y={bezierp2[1] - 10}>{'p2' + bezierp2.join(', ')}</Text>
        <Text x={bezierp3[0]} y={bezierp3[1] - 10}>{'p3' + bezierp3.join(', ')}</Text>
        <Text x={bezierp4[0]} y={bezierp4[1] - 10}>{'p4' + bezierp4.join(', ')}</Text>
        <Text x={bezierp5[0]} y={bezierp5[1] - 10}>{'p5' + bezierp5.join(', ')}</Text>
        <Text x={bezierp6[0]} y={bezierp6[1] - 10}>{'p6' + bezierp6.join(', ')}</Text>
        <Text x={bezierp7[0]} y={bezierp7[1] - 10}>{'p7' + bezierp7.join(', ')}</Text>
        <Text x={bezierp8[0]} y={bezierp8[1] - 10}>{'p8' + bezierp8.join(', ')}</Text>
      </Group>

    </Group>
  };
  
  app.render(<App />);
  