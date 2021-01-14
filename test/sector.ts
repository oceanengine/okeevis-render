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
  stroke: 'blue',
  lineWidth: 20,
  lineJoin: 'round'
})

render.add(shape)