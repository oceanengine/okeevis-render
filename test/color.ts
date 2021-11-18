import Render from '../src/render'
import Circle from '../src/shapes/Circle'
import Rect from '../src/shapes/Rect'
import {RadialGradient, LinearGradient, Pattern, } from '../src/color';

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)
const shape = new Circle({
  cx: 150,
  cy: 150,
  radius: 50,
  fill: 'blue',
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

console.log(shape2.getBBox())

render.add(shape);
render.add(shape2)