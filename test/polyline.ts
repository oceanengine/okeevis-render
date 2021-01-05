import Render from '../src/render'
import Polyline from '../src/shapes/Polyline'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const polyline = new Polyline({
  pointList: [
    {x: 0, y: 0,},
    {x: 100, y: 0,},
    {x: 100, y: 100,},
  ],
  fill: 'red',
  stroke: 'blue'
})
render.add(polyline)
