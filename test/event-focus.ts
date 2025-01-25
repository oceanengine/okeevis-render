import {  Render, Rect, Group } from '../src/index'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {workerEnabled: true})
render.enableDirtyRect = true;

const group = new Group({
  tabIndex: 0,
  onFocus: () => console.log('group focus'),
  onBlur: () => console.log('group blur'),
  stateStyles:{
    focus: {
      showBBox: true,
    }
  }
})

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
  tabIndex: 0,
  onFocus: () => console.log('rect focus'),
  onBlur: () => console.log('rect blur'),
  stateStyles:{
    focus: {
      stroke: '#000',
    }
  }
});
// rect.stopAllAnimation().setAttr({scaleX: 0, scaleY: 0}).animateTo({scale: [2, 2]})

group.add(rect);
group.add(new Rect({
  x: 0,
  y: 0,
  width: 50,
  height: 50,
  fill: 'red'
}))

render.add(group);
render.on('focus', () => {
  console.log('render focus')
});
render.on('blur', () => {
  console.log('render blur')
});


(window as any).rect = rect;

// let a = false;
// window.addEventListener('click', () => {
//     rect.dragMoveBy(10,10);
//     rect.getGlobalTransform();
//     rect.dragMoveBy(10, 10);
// });