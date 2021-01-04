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

const nextText = new Text({
  x: 50,
  y: 400,
  text: 'testddd',
  fontSize: 12,
});

render.addAll(makeText(10))

render.updateAll(makeText(10))


function makeText(count: number) {
  return new Array(count).fill(0).map((value, index) => new Text({
    x: Math.random() * 400,
    y: Math.random() * 600,
    text: index + ''
  }))
}