import Render from '../src/render';
import Use from '../src/shapes/Use';
import Rect from '../src/shapes/Rect';
import Group from '../src/shapes/Group';

const dom = document.getElementById('root') as HTMLDivElement;
const rect = new Rect({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  fill: 'red',
});

const render = new Render(dom);
render.enableDirtyRect = true;

const shape = new Use({
  shape: rect,
  draggable: true,
  translateX: 120,
  stroke: 'blue',
  lineWidth: 2,
  showBBox: true,
});
const shape2 = new Use({
  shape: rect,
  draggable: true,
  translateY: 120,
  stroke: 'yellow',
  lineWidth: 3,
  originX: 50,
  originY: 50,
  scaleX: 2,
  scaleY: 2,
  showBBox: true,
});
const group = new Group();
group.add(
  new Rect({
    x: 200,
    y: 200,
    width: 100,
    height: 100,
    fill: 'yellow',
    draggable: true,
  }),
);
const groupUse = new Use({
  shape: group,
  translateX: 120,
  draggable: true,
  showBBox: true,
});
setTimeout(() => {
  group.childAt(0).animateTo({height: 200})
}, 1000);
render.add(group);
render.add(groupUse);
