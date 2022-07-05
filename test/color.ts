import Render from '../src/render'
import Circle from '../src/shapes/Circle'
import Rect from '../src/shapes/Rect'
import Sector from '../src/shapes/Sector'
import ConicGradient from '../src/color/ConicGradient';
import LinearGradient from '../src/color/LinearGradient';
import RadialGradient from '../src/color/RadialGradient';

const dom = document.getElementById('root') as HTMLElement;
const render = new Render(dom, {renderer: 'canvas'});

const leftRightGraidnet = new LinearGradient({
  x1: 300,
  y1: 300,
  x2: 500,
  y2: 500,
  global: true,
  stops: [
    {
      offset: 0,
      color: 'blue'
    },
    {
      offset: 1,
      color: 'red'
    }
  ]
});

const radialGradient = new RadialGradient({
  cx: 150,
  cy: 150,
  r: 50,
  global: true,
  stops:  [
    {
      offset: 0,
      color: 'blue'
    },
    {
      offset: 1,
      color: 'red'
    }
  ]
})

const conicGradient = new ConicGradient({
  cx: 130,
  cy: 360,
  global: true,
  stops:  [
    {
      offset: 0,
      color: 'blue'
    },
    {
      offset: 1,
      color: 'red'
    }
  ]
})


const shape = new Circle({
  cx: 150,
  cy: 150,
  radius: 50,
  fill: radialGradient,
  stroke: 'red',
  cursor: 'pointer',
})
const shape2 = new Rect({
  x: 300,
  y: 300,
  draggable: true,
  width: 200,
  height: 200,
  fill: leftRightGraidnet,
  stroke: 'red',
  cursor: 'pointer',
})
const sector = new Sector({
  cx: 130,
  cy: 370,
  radius: 100,
  start: 0,
  end: Math.PI*2,
  fill: conicGradient,
})

render.add(shape);
render.add(shape2)
render.add(sector)