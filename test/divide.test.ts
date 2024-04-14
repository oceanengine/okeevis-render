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
});

// rect.stopAllAnimation().setAttr({scaleX: 0, scaleY: 0}).animateTo({scale: [2, 2]})

render.add(rect);

rect.parentNode?.divideChild(rect, 9)