import Render from '../src/render';
import Text from '../src/shapes/Text';
import Group from '../src/shapes/Group';
import Rect from '../src/shapes/Rect';
import Line from '../src/shapes/Line';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom);
const ref = { current: null } as any;

const group = new Group({
  fontSize: 12,
  // fill: 'blue',
  lineWidth: 2,
  stroke: 'blue',
  rotation: 0,
  cursor: 'pointer',
  // clip: new Rect({ref, fill: 'red', x: 50, y: 200, width: 100, height: 100})
});

// group.animateTo({rotation: 2}, 50000)

// ref.current.animateTo({x: 500, height: 500}, 5000)

group.addAll(makeRect(10000));
render.add(group);
// group.updateAll(makeRect(3000));

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
      fill: '#' + Math.random().toString(16).substr(2, 6),
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