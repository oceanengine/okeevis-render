import Render from '../src/render'
import Marker from '../src/shapes/Marker';
import Path from '../src/shapes/Path'
import Use from '../src/shapes/Use';
import Rect from '../src/shapes/Rect';


const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas'})
render.enableDirtyRect = true;

const arrow = Path.fromSvgPath("M 0 0 L 5 2 L 0 4 z").setAttr({
  fill: 'context-stroke',
  lineWidth: 0,
})


const marker = new Marker({
  shape: arrow,
  x: 0,
  y: 2,
  width: 50,
  height: 40,
  orient: 'auto-start-reverse',
});



const bezier = Path.fromSvgPath('M 100,10 C 150,0 150,100 200,100').setAttr({
  draggable: true,
  markerEnd: marker,
  markerStart: marker,
  stroke: 'blue',
  lineWidth: 1,
  lineCap: 'butt',
  pickingBuffer: 60,
})
const rect = new Rect({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  fill: 'context-fill',
  stroke: 'context-stroke',
});
const shape = new Use({
  shape: rect,
  draggable: true,
  translateX: 120,
  lineWidth: 4,
  showBBox: true,
  fill: 'red',
  stroke: 'blue',
});
const shape2 = new Use({
  shape: rect,
  draggable: true,
  translateY: 120,
  lineWidth: 3,
  originX: 50,
  originY: 50,
  scaleX: 2,
  scaleY: 2,
  showBBox: true,
  fill: 'blue',
  stroke: 'red',
});
render.addAll([bezier, shape, shape2])
