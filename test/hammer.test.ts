import Render from '../src/render'
import Rect from '../src/shapes/Rect'
import Hammer from 'hammerjs'

const dom = document.getElementById('root') as HTMLDivElement;
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
  onTouchStart: e => console.log(e)
});
// rect.stopAllAnimation().setAttr({scaleX: 0, scaleY: 0}).animateTo({scale: [2, 2]})

render.add(rect);

var hammer = new Hammer(render as any, {
  inputClass: Hammer.TouchInput
})
hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });

hammer.on('swipe', (ev: any) => {
  console.log(ev)
});