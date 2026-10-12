import Render from '../src/render'
import Rect from '../src/shapes/Rect'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const rect = new Rect({
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill: 'var(--fill)',
  stroke: 'var(--stroke)',
  lineWidth: 2,
  '--fill': 'var(--fill-hover)',
  '--stroke': '#000',
  '--fill-hover': 'blue',
  transitionProperty: 'all',
  transitionDuration: 1000,
  draggable: true,
  hoverStyle:{
    fill: 'var(--stroke)',
  },
})
render.add(rect);

setTimeout(() => {
rect.animate([
  {
    fill: 'var(--fill-hover)'
  },
  {
    fill: 'var(--stroke)'
  }
],{
  duration: 1000,
})
},);
