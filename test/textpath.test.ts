import Render from '../src/render'
import Path from '../src/shapes/Path'
import Polyline from '../src/shapes/Polyline'
import TextPath from '../src/shapes/TextPath';
const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas'})


const path = Path.fromSvgPath('M 50, 50 L 300 50 L 200 240');
const polyline = new Polyline({
    draggable: true,
    pointList: [
      {x: 0, y: 0,},
      {x: 100, y: 0,},
      {x: 100, y: 100,},
      {x: 259, y: 100,},
      {x:150, y: 200,},
    ],
    lineWidth: 1,
    borderRadius: 20,
    fill: 'transparent',
    stroke: 'blue',
    translateX: 50,
    translateY: 50,
  })
path.setAttr({
    stroke: 'blue',
    lineWidth: 5,
    draggable: true,
});

const tp = new TextPath({
    path: polyline,
    text: '12345678901234567890123456789',
    fill: 'red',
    fontSize: 12,
    draggable: true,
    startOffset: 0,
    translateX: 50,
    translateY: 50,
})
tp.animateTo({
    startOffset:  path.getTotalLength()
}, 8000, 'Linear')
render.add(tp);
render.add(polyline)