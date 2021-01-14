import Render from '../src/render'
import Ellipse from '../src/shapes/Ellipse'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)
render.showBoundingRect = false;
const shape = new Ellipse({
  cx: 250,
  cy: 250,
  rx: 200,
  ry: 100,
  fill: 'blue',
  stroke: 'yellow',
  lineWidth: 20,
  fillOpacity: 0.5,
  origin: [250, 250],
})

// shape.animateTo({rotation: Math.PI/ 4,})

render.add(shape);