import Render from '../src/render'
import Text from '../src/shapes/Text'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)
const ref = {current: null} as any;

render.addAll(makeText(0))
render.updateAll(makeText(5))


function makeText(count: number) {
  return new Array(count).fill(0).map((value, index) => new Text({
    ref: index === 0 ? ref: null,
    x: Math.random() * 400,
    y: Math.random() * 600,
    text: index + ''
  }))
}

ref.current.animateTo({x: 100, y: 100,}, 400)