import Render from '../src/render'
import Image from '../src/shapes/Image'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas', workerEnabled: true})

const img = new Image({
  x: 0,
  y: 0,
  width: 200,
  height: 358,
  showBBox: true,
  src: './test.png',
  draggable: true,
  preserveAspectRatio: 'xMidYMid meet',
  onMouseLeave: e => console.log(e.type)
})
const img2 = new Image({
  x: 300,
  y: 400,
  width: 400,
  height: 100,
  showBBox: true,
  src: '/test.png',
  preserveAspectRatio: 'xMidYMid slice',
  crossOrigin: 'use-credentials'
})

render.add(img)
render.add(img2)
