import Render from '../src/render';
import Group from '../src/shapes/Group';
import CompoundPath from '../src/shapes/CompoundPath';
import Circle from '../src/shapes/Circle';
import Polyline from '../src/shapes/Polyline';
import Path from '../src/shapes/Path';
import Line from '../src/shapes/Line';
import Rect from '../src/shapes/Rect';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom);
render.showBoundingRect = false;

const shape1 = new Circle({
  cx: 200,
  cy: 200,
  radius: 100,
  fill: 'blue',
  draggable: true,
  cursor: 'move',
  onWheel: e => console.log(e),
  onMouseDown: e => console.log(e),
  onMouseUp: e => console.log(e),
  onClick: e => console.log(e),
  onDblClick: e => console.log(e),
  onMouseOver: e => console.log(e),
  onMouseOut: e => console.log(e),
  onMouseEnter: e => e.target.setAttr({ fill: 'red' }),
  onMouseLeave: e => e.target.setAttr({ fill: 'blue' }),
  onDragStart: e => console.log(e),
  onDragEnd: e => console.log(e),
  getDragOffset: e => {
    return { x: e.dx, y: e.dy };
  },
  onMounted() {
    shape1.animateTo({ cx: 400 }, 1400);
  },
});
shape1.on('dblclick', (e: any) => console.log('dblclick from on'));
const shape2 = new Circle({
  cx: 320,
  cy: 480,
  radius: 100,
  fill: 'green',
  onDrop: e => e.target.setAttr({ fill: 'yellow' }),
  onDragOver: e => e.target.setAttr({ fill: 'red' }),
  onDragLeave: e => e.target.setAttr({ fill: 'green' }),
});

const rect = new Rect({
  x: 300,
  y: 300,
  width: 40,
  height: 80,
  fill: 'blue',
  origin: [300, 300],
  rotation: (45 * Math.PI) / 180,
  draggable: true,
});

setTimeout(() => {
  // shape2.setAttr({display: false})
}, 3000);
const shape3 = new Circle({});
const shape4 = new Circle();

const group1 = new Group({
  draggable: true,
  cursor: 'pointer',
  onMouseEnter: e => console.log('group enter'),
  onMouseLeave: e => console.log('gorup leave'),
  onMouseOver: e => console.log('group over'),
  onMouseOut: e => console.log('group out'),
});

const eventRect = new Rect({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  fill: 'red',
  onClick: e => console.log('event rect click'),
  onMouseEnter: e => console.log('event rect over'),
  onMouseLeave: e => console.log('event rect leave'),
});
const group2 = new Group({});

group1.add(shape1);
group1.add(shape2);

render.add(group1);
render.add(group2);
render.add(rect);
render.addEventElement(eventRect);
render.on('mouseenter', (e: any) => console.log('canvas mouseenter'));
render.on('mouseleave', (e: any) => console.log('canvas mouseleave'));
