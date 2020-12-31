import Render from '../src/render'
import Text from '../src/shapes/Text'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const text = new Text({
  x: 50,
  y: 50,
  text: 'test',
  fontSize: 12,
})
render.add(text)
new Array(3000).fill(0).forEach(item => {
  const t = new Text({
    x: Math.random() * 400,
    y: Math.random() * 600,
    text: Math.random() + '',
    fontSize: 12,
  })
  render.add(t)
})
text.animateTo({x: 400}, 4000)