import Render from '../src/render'
import Circle from '../src/shapes/Circle'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'svg'})
const shape = new Circle({
  cx: 150,
  cy: 150,
  radius: 50,
  fill: 'blue',
  stroke: 'red',
  lineWidth: 20,
  fillOpacity: 0.5,
})
render.add(shape);