import Render from '../src/render';
import Text from '../src/shapes/Text';
import Group from '../src/shapes/Group';
import Rect from '../src/shapes/Rect';
import Line from '../src/shapes/Line';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom);
render.showFPS = true;
render.showBBox = false;

const ref = { current: null } as any;

const group = new Group({
  fill: 'blue',
});

group.addAll(makeText(2500));
render.add(group);
group.updateAll(makeText(2500));
document.onclick = e => {
  return
  group.add(new Rect({
    x: Math.random() * 1920,
    y: Math.random() * 1080,
    width: 100,
    height: 100,
    fill: 'red',
    cursor: 'pointer'
  }))
}

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
      width: 50,
      height: 50,
    });
  });
}

function makeLine(count: number) {
  return new Array(count).fill(0).map((value, index) => {
    const x1= Math.random() * 1900;
    const y1 =  Math.random() * 1080;
    const x2 = x1  + Math.random() * 100;
    const y2 = y1 + Math.random() * 100;
    return new Line({
     x1,
     y1,
     x2,
     y2,
    });
  });
}
// render.resize(1900, 1080)