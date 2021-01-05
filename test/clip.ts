import Render from '../src/render'
import Rect from '../src/shapes/Rect'
import Circle from '../src/shapes/Circle'
import Group from '../src/shapes/Group'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const clip = new Circle({
  cx: 200, cy: 200,
  radius: 60,
})
const clip2 = new Circle({
  cx: 150, cy: 150,
  radius: 20,
})

const rect = new Rect({
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill: 'blue',
  stroke: 'red',
  lineWidth: 2,
})


const group = new Group({
})
group.add(rect);

render.add(group)
