import Render from '../src/render'
import Image from '../src/shapes/Image'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const img = new Image({
  x: 0,
  y: 0,
  src: 'https://lf1-hscdn-tos.pstatp.com/obj/developer-baas/baas/ttkw6x/140eef26a890065b_1601003200893.png'
})
render.add(img)
