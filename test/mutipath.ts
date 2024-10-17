import Render from '../src/render'
import CompoundPath from '../src/shapes/CompoundPath';
import Circle from '../src/shapes/Circle';
import Polyline from '../src/shapes/Polyline';
import Path from '../src/shapes/Path';
import Line from '../src/shapes/Line';

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)




const shape1 = new Polyline({
  pointList: [
    {x: 100, y: 200},
    {x: 150, y: 100},
    {x: 200, y: 200}
  ]
})

const shape2 = new Polyline({
  pointList: [
    {x: 200, y: 200},
    {x: 200, y: 250},
    {x:100, y: 250},
    {x: 100, y: 200}
  ]
})
const shape3 = new Polyline({
  pointList: [
    {x: 200, y: 200},
    {x: 200, y: 450},
    {x:100, y: 450},
    {x: 100, y: 200}
  ]
})

const shape = new CompoundPath({
  shapes: [shape1, shape2],
  closePath: true,
  fill: 'blue',
  stroke: '#333',
  lineWidth: 5,
  draggable: true,
  pickByShape: true,
})


render.add(shape)