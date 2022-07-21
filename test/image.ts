import Render from '../src/render'
import Image from '../src/shapes/Image'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas'})

const img = new Image({
  x: 0,
  y: 0,
  width: 200,
  height: 358,
  showBBox: true,
  src: './test.png',
  preserveAspectRatio: 'xMidYMin',
})
const img2 = new Image({
  x: 300,
  y: 400,
  width: 100,
  height: 100,
  showBBox: true,
  src: './test.png',
  preserveAspectRatio: 'xMidYMin',
})

render.add(img)
render.add(img2)
