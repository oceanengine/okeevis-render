import Render from '../src/render'
import Line from '../src/shapes/line'
import Rect from '../src/shapes/Rect';
import Circle from '../src/shapes/Circle'
import Arc from '../src/shapes/Arc'
import Marker from '../src/shapes/Marker';
import Path from '../src/shapes/Path'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'svg'})
render.enableDirtyRect = true;

const arrow = Path.fromSvgPath("M 0 0 L 5 2 L 0 4 z").setAttr({
  fill: 'red',
  lineWidth: 0,
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
  width: 50,
  height: 40,
  orient: 'auto-start-reverse'
});

const shapeRect = new Rect({
  x: 300,
  y: 300,
  width: 100,
  height: 100,
  lineWidth: 1,
  stroke: 'red',
  markerEnd: marker,
})

const shapeCircle = new Circle({
  cx: 150,
  cy: 300,
  radius: 50,
  stroke: 'red',
  lineWidth: 1,
  markerEnd: marker
})
const shapeArc = new Arc({
  cx: 259,
  cy: 55,
  radius: 50,
  start: 0,
  end: Math.PI / 3,
  stroke: 'red',
  lineWidth: 1,
  markerEnd: marker
})

const bezier = Path.fromSvgPath('M 100,10 C 150,0 150,100 200,100').setAttr({
  draggable: true,
  markerEnd: marker,
  markerStart: marker,
  stroke: 'blue',
  lineWidth: 1,
  lineCap: 'butt',
  pickingBuffer: 60,
})
const shpaeLine = new Line({
  x1: 150,
  y1: 150,
  x2: 250,
  y2: 250,
  lineWidth: 1,
  stroke: 'red',
  markerEnd: marker,
})

render.add(bezier)
render.add(shapeRect)
render.add(shapeCircle)
render.add(shapeArc)
render.add(shpaeLine)
console.log(render)