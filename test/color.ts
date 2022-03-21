import Render from '../src/render'
import Circle from '../src/shapes/Circle'
import Rect from '../src/shapes/Rect'
import ConicGradient from '../src/color/ConicGradient';

const dom = document.getElementById('root')
const render = new Render(dom)
const shape = new Circle({
  cx: 150,
  cy: 150,
  radius: 50,
  fill: new ConicGradient({
    cx: 0.5,
    cy: 0.5,
    stops: [{
      offset: 0,
      color: 'blue'
    },
  {
    offset: 1,
    color: 'red'
  }]
  }),
  stroke: 'red',
  cursor: 'pointer',
})
const shape2 = new Rect({
  x: 300,
  y: 300,
  width: 200,
  height: 200,
  fill: 'blue',
  stroke: 'red',
  cursor: 'pointer',
})

render.add(shape);
render.add(shape2)