import Render from '../src/render'
import CompoundPath from '../src/shapes/CompoundPath';
import Circle from '../src/shapes/Circle';

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)


const shape1 = new Circle({
  cx: 390,
  cy: 120,
  radius: 100,
})

const shape2 = new Circle({
  cx: 390,
  cy: 120,
  radius: 50,
})

const shape = new CompoundPath({
  paths: [shape1, shape2],
  fill: 'blue',
  stroke: '#333',
  lineWidth: 5,
})

render.add(shape)
