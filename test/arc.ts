import Render from '../src/render'
import Arc from '../src/shapes/Arc'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)
const shape = new Arc({
  cx: 220,
  cy: 250,
  radius: 100,
  start: 0,
  end: Math.PI / 2,
  stroke: 'blue',
  fill: 'blue',
  fillOpacity: 0.5,
  lineWidth: 30,
  closePath: false,
  origin: [250, 270],
  strokeNoScale: false,
  lineJoin: 'round',
  lineCap: 'butt',
  scale: [2, 2,]
})

render.showBoundingRect = true;

render.add(shape)
