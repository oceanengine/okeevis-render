import Render from '../src/render'
import Line from '../src/shapes/line'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const line = new Line({
  x1: 0,
  y1: 0,
  x2: 100,
  y2: 100,
  stroke: 'red',
  lineWidth: 1,
})
render.add(line)
setTimeout(() => line.setAttr({stroke: 'blue'}), 1000)