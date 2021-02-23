import Render from '../src/render'
import Sector from '../src/shapes/Sector'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'svg'})

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
const shape3 = new Sector({
  draggable: true,
  cornerRadius: 0,
cx: 291,
cy: 179,
display: true,
start: 0,
fill: "blue",
radius: 124,
radiusI: 50,
round: false,
end: Math.PI * 2,
stroke: 'red',
lineWidth: 2,
})
render.add(shape3)
console.log(shape2)