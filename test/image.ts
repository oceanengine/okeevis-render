import Render from '../src/render'
import Image from '../src/shapes/Image'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'svg'})

const img = new Image({
  x: 0,
  y: 0,
  width: 200,
  height: 358,
  showBBox: true,
  src: 'https://lf1-hscdn-tos.pstatp.com/obj/developer-baas/baas/ttkw6x/140eef26a890065b_1601003200893.png',
  preserveAspectRatio: 'xMidYMin',
})
render.add(img)
