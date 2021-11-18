import Render from '../src/render'
import Polygon from '../src/shapes/Polygon'

document.body.onclick = e => console.log(e.offsetX, e.offsetY)

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)
render.showBoundingRect =true;
const shape = new Polygon({
  pointList: [
    {x: 106, y: 70},
    {x: 230, y: 135},
    {x: 94, y: 209},
  ],
  fill: 'blue',
  stroke: 'green',
  lineJoin: 'round',
  lineWidth: 20,
})
render.add(shape);