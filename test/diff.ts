import Render from '../src/render';
import Text from '../src/shapes/Text';
import Group from '../src/shapes/Group';
import Rect from '../src/shapes/Rect';
import Line from '../src/shapes/Line';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom);
const ref = { current: null } as any;

const group = new Group({
  fontSize: 10,
  fill: 'red',
  stroke: 'blue',
  lineWidth: 1,
});

group.addAll(makeLine(3000));
render.add(group);
group.updateAll(makeLine(3000));

function makeText(count: number) {
  return new Array(count).fill(0).map((value, index) => {
    return new Text({
      ref: index === 0 ? ref : null,
      x: Math.random() * 400,
      y: Math.random() * 600,
      text: index + '',
    });
  });
}

function makeRect(count: number) {
  return new Array(count).fill(0).map((value, index) => {
    return new Rect({
      x: Math.random() * 600,
      y: Math.random() * 480,
      width: 100,
      height: 100,
    });
  });
}

function makeLine(count: number) {
  return new Array(count).fill(0).map((value, index) => {
    return new Line({
      x1: Math.random() * 600,
      y1: Math.random() * 480,
      x2: Math.random() * 600,
      y2: Math.random() * 480,
    });
  });
}
