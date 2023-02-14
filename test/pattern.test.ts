import Render from '../src/render'
import Rect from '../src/shapes/Rect';
import Pattern from '../src/color/Pattern';
import LinearGradient from '../src/color/LinearGradient';

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas', workerEnabled: true})
;
render.enableDirtyRect = true;
render.showFPS = true;
const pattern = new Pattern({
  width: 20,
  height: 20,
  element: new Rect({x: 2, y: 2, width: 4, height: 4, fill: 'red', lineWidth: 1, stroke: 'blue'}),
})

const leftRightGraidnet = new LinearGradient({
  x1: 0,
  y1: 0,
  x2: 1,
  y2: 0,
  stops: [
    {
      offset: 0,
      color: 'blue'
    },
    {
      offset: 1,
      color: 'red'
    }
  ]
});
const rect = new Rect({
  x: 0,
  y: 0,
  rotation: 0,
  width: 300,
  height: 300,
  fill: pattern,
  draggable: true,
})

render.add(rect)
render.add(new Rect({
  x: 100, 
  y: 0,
  width: 20,
  height: 20,
  fill: 'blue',
  draggable:true,
}))
rect.animateTo({
  rotation: 3,
  originX: 250,
  originY: 250,
 
}, 5000);

(window as any).render = render;