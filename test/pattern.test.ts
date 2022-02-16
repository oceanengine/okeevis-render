import Render from '../src/render'
import Rect from '../src/shapes/Rect';
import Pattern from '../src/color/Pattern';

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas'})
const pattern = new Pattern({
  width: 20,
  height: 20,
  element: new Rect({x: 2, y: 2, width: 4, height: 4, fill: 'red', lineWidth: 1, stroke: 'blue'}),
})

const rect = new Rect({
  x: 0,
  y: 0,
  width: 1000,
  height: 1000,
  fill: pattern
})

render.add(rect)
