import Render from '../src/render'
import Arc from '../src/shapes/Arc'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

render.add(new Arc({
  cx: 150,
  cy: 150,
  radius: 100,
  start: 0,
  end: Math.PI / 2,
  stroke: 'red',
}))