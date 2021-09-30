import Render from '../src/render'
import Line from '../src/shapes/line'
import Rect from '../src/shapes/Rect';
import Marker from '../src/shapes/Marker';
import Path from '../src/shapes/Path'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'svg'})
render.enableDirtyRect = true;

const arrow = Path.fromSvgPath("M 0 0 L 10 5 L 0 10 z").setAttr({
  fill: 'red',
  fillOpacity: 0.5,
})

const rect = new Rect({
  x: 0,
  y: 0,
  width: 20,
  height: 40,
  fill: 'red',
  fillOpacity: 0.2,
})

const marker = new Marker({
  shape: arrow,
  x: 5,
  y: 5,
  width: 10,
  height: 10,
  orient: 'auto-start-reverse'
});

const line = new Line({
  x1: 200,
  y1: 200,
  x2: 300,
  y2: 300,
  draggable: true,
  markerEnd: marker,
  markerMid: marker,
  markerStart: marker,
  stroke: 'blue',
  lineWidth: 1,
  lineCap: 'butt',
  origin: [300, 300],
})

render.add(line)

console.log(render)