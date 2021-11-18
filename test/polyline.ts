import Render from '../src/render'
import Polyline from '../src/shapes/Polyline'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const polyline = new Polyline({
  draggable: true,
  pointList: [
    {x: 0, y: 0,},
    {x: 100, y: 0,},
    {x: 100, y: 100,},
  ],
  lineWidth: 2,
  fill: 'red',
  stroke: 'blue'
})
const polyline2 = new Polyline({
  draggable: true,
  lineWidth: 2,
  pointList: [
    {x: 0, y: 0,},
    {x: 100, y: 0,},
    {x: 100, y: 100,},
    {x: 100, y: 300,},
    {x: 200, y: 250,},
    {x: 100, y: 180,},
  ],
  smooth: true,
  stroke: 'blue'
})

render.add(polyline)
render.add(polyline2)
