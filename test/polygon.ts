import Render from '../src/render'
import Polygon from '../src/shapes/Polygon'


const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'svg'})
const shape = new Polygon({
  pointList: [
    {x: 106, y: 70},
    {x: 230, y: 135},
    {x: 94, y: 209},
  ],
  stroke: 'blue',
  draggable: true,
  fill: 'red',
  borderRadius: [10, 10],
  lineWidth: 2,
})
render.add(shape);