import Render from '../src/render'
import Sector from '../src/shapes/Sector'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const shape = new Sector({
  cx: 200,
  cy: 200,
  radius: 80,
  start: -Math.PI / 2,
  end: 1,
  radiusI:40,
  fill: 'blue',
  stroke: '#333',
  lineWidth: 2,
  lineJoin: 'round'
})
const shape2 = new Sector({
  cx: 200,
  cy: 200,
  radius: 80,
  start: -Math.PI / 2,
  end: -Math.PI / 2 - 1e-8,
  radiusI:40,
  fill: 'blue',
  stroke: '#333',
  lineWidth: 2,
  lineJoin: 'round'
})
render.add(shape)
render.add(shape2)
console.log(shape2)