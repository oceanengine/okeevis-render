import Render from '../src/render'
import Text from '../src/shapes/Text'
import Group from '../src/shapes/Group';

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)
const ref = {current: null} as any;

const group = new Group({
  fill: 'red',
})

group.addAll(makeText(3000))
render.add(group);
group.updateAll(makeText(3000))

function makeText(count: number) {
  return new Array(count).fill(0).map((value, index) => {
    return new Text({
      ref: index === 0 ? ref: null,
      x: Math.random() * 400,
      y: Math.random() * 600,
      text: index + '',
    })
  })
}
