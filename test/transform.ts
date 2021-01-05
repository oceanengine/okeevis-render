import Render from '../src/render'
import Polyline from '../src/shapes/Polyline'
import Group from '../src/shapes/Group'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const polyline = new Polyline({
  pointList: [
    {x: 0, y: 0,},
    {x: 100, y: 0,},
    {x: 100, y: 100,},
  ],
  fill: 'red',
  stroke: 'blue',
  rotation: 1 * Math.PI / 11,
});

const group = new Group({
  rotation: Math.PI / 10,
})
group.add(polyline)
render.add(group)