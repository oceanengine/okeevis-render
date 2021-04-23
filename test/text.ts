import Render from '../src/render'
import Text from '../src/shapes/Text'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas'})
render.showFPS = true;
render.showBBox = true;
const fontSize = 30;
const textAlign = 'left'
const text = 'Tenfdsfdsdddddddddddddfdsst'
const textBaseline = 'bottom'
const y = 200;
const lineHeight = 40;
const truncate = {outerWidth: 100} as any
const maxWidth = 1000;
const textEl = new Text({
  draggable: true,
  x: 120,
  y,
  text,
  textAlign,
  textBaseline,
  maxWidth,
  fill: 'red',
  fontSize,
  truncate,
  lineHeight,
  cursor: 'pointer'
})
const render2 = new Render(document.getElementById('root2') as any, {renderer: 'canvas'})
render2.showBoundingRect = true;

const text2 = new Text({
  draggable: true,
  x: 120,
  y,
  text,
  textAlign,
  maxWidth,
  textBaseline,
  fill: 'red',
  fontSize,
  truncate,
  lineHeight,
  onClick: e => e.target.setAttr({text: 'fdsfsdfdsfsfdsfsdfdfdsfds'})
})

render.add(textEl)
render2.add(text2)
