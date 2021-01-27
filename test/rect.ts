import Render from '../src/render'
import Rect from '../src/shapes/Rect'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'svg'})

const rect = new Rect({
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill: 'blue',
  stroke: 'red',
  lineWidth: 2,
  r: 200,
})

render.add(rect)