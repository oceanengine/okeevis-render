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