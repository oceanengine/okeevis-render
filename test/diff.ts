import Render from '../src/render';
import Text from '../src/shapes/Text';
import Group from '../src/shapes/Group';
import Rect from '../src/shapes/Rect';
import Line from '../src/shapes/Line';
import Circle from '../src/shapes/Circle';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, {renderer: 'canvas'});
render.showFPS = false;
render.showBBox = false;
render.enableDirtyRect = false

const ref = { current: null } as any;
(window as any).render = render;

const group = new Group({
  fill: 'blue',
});

group.addAll(makeCircle(3000));
render.add(group);
group.children().forEach(item => item.animateTo({
  position: [Math.random() * 640, Math.random()*480],
}, 50000))
// group.updateAll(makeText(3000))
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
      transitionDuration: 50000,

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


function makeCircle(count: number) {
  return new Array(count).fill(0).map((value, index) => {
    return new Circle({
      cx: 10,
      cy: 10,
      radius: 5 + Math.random() * 10,
      position: [Math.random() * 1000, Math.random()*600],
      fill: '#' + Math.random().toString(16).substr(2, 6),
    })
  });
}

render.resize(1000, 600)