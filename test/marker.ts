import Render from '../src/render'
import Line from '../src/shapes/line'
import Rect from '../src/shapes/Rect';
import Marker from '../src/shapes/Marker';
import Path from '../src/shapes/Path'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas'})
render.enableDirtyRect = true;

const arrow = Path.fromSvgPath("M 0 0 L 5 2 L 0 4 z").setAttr({
  fill: 'red',
})

const rect = new Rect({
  x: 0,
  y: 0,
  width: 5,
  height: 4,
  fill: 'red',
  fillOpacity: 0.2,
})

const marker = new Marker({
  shape: arrow,
  x: 0,
  y: 2,
  width: 10,
  height: 10,
  orient: 'auto'
});

const line = Path.fromSvgPath('M 100,0 C 150,0 150,100 200,100').setAttr({
  draggable: true,
  markerEnd: marker,
  markerStart: marker,
  stroke: 'blue',
  lineWidth: 1,
  lineCap: 'butt',
  pickingBuffer: 60,
})

render.add(line)

console.log(render)