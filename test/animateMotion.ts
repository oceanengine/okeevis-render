import Render from '../src/render'
import Line from '../src/shapes/line'
import Rect from '../src/shapes/Rect';
import Circle from '../src/shapes/Circle'
import Arc from '../src/shapes/Arc'
import Path from '../src/shapes/Path'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas'})
render.enableDirtyRect = true;

const arrow = Path.fromSvgPath("M 0 0 L 5 2 L 0 4 z").setAttr({
  fill: 'red',
  lineWidth: 0,
})

const shapeRect = new Rect({
  x: 300,
  y: 300,
  width: 100,
  height: 100,
  lineWidth: 1,
  stroke: 'red',
})

const shapeCircle = new Circle({
  cx: 150,
  cy: 300,
  radius: 50,
  stroke: 'red',
  lineWidth: 1,
})
const shapeArc = new Arc({
  cx: 259,
  cy: 55,
  radius: 50,
  start: 0,
  end: Math.PI / 3,
  stroke: 'red',
  lineWidth: 1,
})

const bezier = Path.fromSvgPath('M 100,10 C 150,0 150,100 200,100').setAttr({
  draggable: true,
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
})
;
[bezier, shapeRect, shapeCircle,shapeArc , shpaeLine].forEach(item => {
  const circle = Path.fromSvgPath("M 0 0 L 10 4 L 0 8 z").setAttr({
    fill: 'red',
    lineWidth: 0,
  });
  render.add(circle)
  circle.animateMotion({
    path: item.getPathData(),
    during: 3000,
    rotate: 'auto',
  })

})

render.add(bezier)
render.add(shapeRect)
render.add(shapeCircle)
render.add(shapeArc)
render.add(shpaeLine)