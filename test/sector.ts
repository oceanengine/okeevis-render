import Render from '../src/render'
import Sector from '../src/shapes/Sector'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const shape = new Sector({
  cx: 200,
  cy: 200,
  radius: 80,
  start: 0,
  end: 1,
  radiusI: 20,
  fill: 'red',
  stroke: 'blue',
  lineWidth: 2,
})

render.add(shape)