import Render from '../src/render'
import Text from '../src/shapes/Text'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas'})

const textEl = new Text({
  x: 120,
  y: 120,
  text: 'hover me 李国',
  fill: '#333',
  fontSize: 200,
  tabIndex: 0,
  textDecoration: 'underline',
  stateStyles: {
    hover: {
      fill: 'blue',
    },
    focus:{
      fill: 'yellow'
    }
  }
})

const textEl2 = new Text({
  x: 120,
  y: 220,
  text: 'click me',
  fill: '#333',
  tabIndex: -1,
  textDecoration: 'line-through',
  fontSize: 80,
  onClick: e => console.log(e),
  stateStyles: {
    focus: {
      fill: 'blue',
    }
  }
})

const textEl3 = new Text({
  x: 120,
  y: 320,
  text: 'click me, focus able',
  fill: '#333',
  fontSize: 80,
  tabIndex: 0,
  onFocus: e => console.log(e),
  onBlur: e => console.log(e),
  onKeyDown: e => console.log(e),
  stateStyles: {
    focus: {
      fill: 'blue',
    }
  }
})
;
(window as any).node = textEl3;

setTimeout(() => {
    textEl3.focus();
}, 1000);

render.addAll([textEl, textEl2, textEl3])
// render.on('focus', e => console.log(e));
// render.on('focusin', e => console.log(e));
// render.on('blur',e => console.log(e))
// render.on('keydown', e => console.log(e));