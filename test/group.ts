import Render from '../src/render';
import Text from '../src/shapes/Text';
import Group from '../src/shapes/Group';
import Rect from '../src/shapes/Rect';
import Line from '../src/shapes/Line';
import Circle from '../src/shapes/Circle';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, {renderer: 'canvas'});

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
  fill: 'blue'
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
  i ++ 
  if (i % 2 === 0) {
    group.updateAll([]);
  } else {
    group.updateAll([a, b]);
  }
}
