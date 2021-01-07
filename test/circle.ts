import Render from '../src/render'
import Circle from '../src/shapes/Circle'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)
const shape = new Circle({
  cx: 150,
  cy: 150,
  radius: 50,
  fill: 'blue',
  stroke: 'red'
})
render.add(shape);