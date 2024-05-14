import Render from '../src/render'
import Rect from '../src/shapes/Rect'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {workerEnabled: true})
render.enableDirtyRect = true;

const rect = new Rect({
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill: 'blue',
  stroke: 'red',
  lineWidth: 20,
  draggable: true,
  rotation: 0.02,
});
rect.setStatusAttr('hover', {
  fill: 'red',
  rotation: Math.PI / 18,
});

// rect.stopAllAnimation().setAttr({scaleX: 0, scaleY: 0}).animateTo({scale: [2, 2]})

render.add(rect);
(window as any).rect = rect;

// let a = false;
// window.addEventListener('click', () => {
//     rect.dragMoveBy(10,10);
//     rect.getGlobalTransform();
//     rect.dragMoveBy(10, 10);
// });