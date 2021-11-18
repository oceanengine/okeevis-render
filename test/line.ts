import Render from '../src/render'
import Line from '../src/shapes/line'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)
render.showFPS = true;
const line = new Line({
  x1: 200,
  y1: 200,
  x2: 300,
  y2: 300,
  stroke: 'blue',
  lineWidth: 60,
  lineCap: 'square',
  origin: [300, 300]
})

line.animateTo({
  rotation: Math.PI * 2
}, 10000)

render.add(line)
render.showBoundingRect = true;
