
import Render from '../src/render'
import Arc from '../src/shapes/Arc'
import Circle from '../src/shapes/Circle'
import Group from '../src/shapes/Group'
import Image from '../src/shapes/Image'
import Line from '../src/shapes/Line'
import Path from '../src/shapes/Path'
import Polygon from '../src/shapes/Polygon'
import Poyline from '../src/shapes/Polyline'
import Rect from '../src/shapes/Rect'
import Sector from '../src/shapes/Sector'
import Text from '../src/shapes/Text'
import {LinearGradient, RadialGradient, Pattern ,brighten  } from '../src/color';
import Wheel from '../src/event/SyntheticWheelEvent'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas'});
render.showFPS = true;
const data = (window as any).data as any

const rootGroup = new Group({
  draggable: true,
  scaleX: 2,
  scaleY: 2,
  onDragStart: (e: any) => {
    if (e.target !== rootGroup ) {
      return
    }
    labelGroup.setAttr('display', false)
    edgeGroup.setAttr('display', false)
  },
  onDragEnd: (e: any) => {
    if (e.target !== rootGroup ) {
      return
    }
    labelGroup.setAttr('display', true)
    edgeGroup.setAttr('display', true)
  }
});
rootGroup.add(new Rect({
  x: 0,
  y: 0,
  width: 1920,
  height: 1080,
  fill: 'transparent'
}))
let scale = 1;
render.on('wheel', (event: Wheel) => {
  scale *= (1 - event.deltaY / 120 / 30)
  rootGroup.setAttr({
    scale: [scale, scale]
  });
  rootGroup.dirtyTransform()
})
const nodeGroup = new Group({
  fill: '#cbe5fc',
  stroke: '#333',
  lineWidth: 1,
})
const edgeGroup = new Group({
  stroke: '#aaa',
  lineWidth: 1,
  strokeNoScale: true,
  pointerEvents: 'none'
})

const labelGroup =new Group({
  fill: '#333',
  fontSize: 3,
  pointerEvents: 'none'
})

data.nodes.forEach((node: any) => {
  const {x, y, size } = node;
  nodeGroup.add(new Circle({
   draggable: true,
   cx: x,
   cy: y,
   radius: size,
   onMouseOver: e => e.target.setAttr({fill: 'red', stroke:'#000', lineWidth: 2}),
   onMouseOut: e => e.target.setAttr({fill: '#cbe5fc', stroke:'#333', lineWidth: 1})
  }))

  labelGroup.add(new Text({
    x: x + size + 4,
    y,
    text: node.olabel,
    textAlign: 'left',
    textBaseline: 'middle'
  }))
})
console.log(data.edges.slice(0, 10))
data.edges.forEach((edge: any) => {
  const {startPoint, endPoint} = edge;
  edgeGroup.add(new Line({
    x1: startPoint.x,
    y1: startPoint.y,
    x2: endPoint.x,
    y2: endPoint.y,
  }))
})
rootGroup.add(nodeGroup)
rootGroup.add(edgeGroup)
// rootGroup.add(labelGroup)
render.add(rootGroup)
console.log(rootGroup.getLeafNodesSize())
render.resize(1920, 900)