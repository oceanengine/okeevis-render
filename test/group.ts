import Render from '../src/render';
import Text from '../src/shapes/Text';
import Group from '../src/shapes/Group';
import Rect from '../src/shapes/Rect';
import Line from '../src/shapes/Line';
import Circle from '../src/shapes/Circle';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, {renderer: 'svg'});
render.enableDirtyRect = true
const group = new Group();
const a = new Rect({
  key: 1,
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill: 'red'
});

const b = new Rect({
  key: 2,
  x: 150,
  y: 150,
  width: 100,
  height: 100,
  fill: 'blue',
  shadowColor: 'red',
  shadowBlur: 40,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  onMouseEnter: e => {
    e.target.animateTo({shadowBlur: 20});
  },
  onMouseLeave: e => e.target.animateTo({shadowBlur: 0})
})

const a2 = new Rect({
  key: 1,
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill: 'red'
});

const b2 = new Rect({
  key: 2,
  x: 150,
  y: 150,
  width: 100,
  height: 100,
  fill: 'blue',
  
})

render.add(group);

group.addAll([a, b]);
let i = 0;
document.onclick = () => {
  render.downloadImage('fdfsd')
}
