import Render from '../src/render'
import Polygon from '../src/shapes/Polygon'


const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'svg'})
const shape = new Polygon({
  pointList: [
    {x: 10, y: 10},
    {x: 100, y: 10},
    {x: 100, y: 200},
    {x: 100, y: 200},
  ],
  stroke: 'blue',
  draggable: true,
  fill: 'red',
  borderRadius: 10,
  lineWidth: 2,
})
render.add(shape);