import Render from '../src/render'
import Rect from '../src/shapes/Rect'
import Circle from '../src/shapes/Circle'
import Group from '../src/shapes/Group'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'svg'})

const clip = new Rect({
  x: 0,
  y: 0,
  width: 50,
  height: 50
})

const group = new Group({
  translateX: 100,
  clip,
});
const rect = new Rect({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  fill: 'blue',
 
  cursor: 'pointer',
  onMouseEnter: e => console.log(e)
})

group.add(rect)
render.add(group)
