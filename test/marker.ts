import Render from '../src/render'
import Line from '../src/shapes/line'
import Rect from '../src/shapes/Rect';
import Marker from '../src/shapes/Marker';

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)
render.enableDirtyRect = false


const rect = new Rect({
  x: 0,
  y: 0,
  width: 20,
  height: 20,
  fill: 'red'
})

const marker = new Marker({
  shape: rect,
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  orient: 'auto'
});

const line = new Line({
  x1: 200,
  y1: 200,
  x2: 300,
  y2: 300,
  markerEnd: marker,
  stroke: 'blue',
  lineWidth: 1,
  lineCap: 'square',
  origin: [300, 300],
})

render.add(line)

console.log(render)