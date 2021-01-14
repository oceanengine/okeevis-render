import Render from '../src/render'
import Arc from '../src/shapes/Arc'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)
const shape = new Arc({
  cx: 220,
  cy: 250,
  radius: 200,
  start: 0,
  end: Math.PI *  3 / 2,
  stroke: 'blue',
  fill: 'blue',
  fillOpacity: 0.5,
  lineWidth: 20,
})


render.add(shape)
