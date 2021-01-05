import Render from '../src/render'
import Path from '../src/shapes/Path'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const path = new Path({
 brush: ctx => {
   ctx.moveTo(0, 0);
   ctx.lineTo(100, 100)
 },
 stroke: 'red',
})

render.add(path)