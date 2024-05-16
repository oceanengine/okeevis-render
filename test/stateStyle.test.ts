import Render from '../src/render'
import Text from '../src/shapes/Text'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas'})

const textEl = new Text({
  x: 120,
  y: 120,
  text: 'hover me',
  fill: '#333',
  fontSize: 80,
  stateStyles: {
    hover: {
      fill: 'blue',
    }
  }
})

const textEl2 = new Text({
  x: 120,
  y: 220,
  text: 'click me',
  fill: '#333',
  fontSize: 80,
  stateStyles: {
    active: {
      fill: 'blue',
    }
  }
})

const textEl3 = new Text({
  x: 120,
  y: 320,
  text: 'click me',
  fill: '#333',
  fontSize: 80,
  stateStyles: {
    selected: {
      fill: 'blue',
    }
  },
  onClick: e => e.target.setState('selected', true),
})

render.addAll([textEl, textEl2, textEl3])
