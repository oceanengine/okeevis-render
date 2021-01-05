import Render from '../src/render'
import Line from '../src/shapes/Line'
import Group from '../src/shapes/Group'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const line = new Line({
  x1:0,
  y1: 0,
  x2: 100,
  y2: 0,
  fill: 'red',
  stroke: 'blue',
  rotation: 0,
});

const group = new Group({
  rotation: 0 * Math.PI / 10,
})
group.add(line)
render.add(group)

group.translate(100, 0)

group.animateTo({
  rotation: Math.PI/ 2,
}, 4000)