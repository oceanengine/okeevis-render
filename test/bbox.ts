

import Render from '../src/render'
import Arc from '../src/shapes/Arc'
import Circle from '../src/shapes/Circle'
import Group from '../src/shapes/Group'
import Image from '../src/shapes/Image'
import Line from '../src/shapes/Line'
import Path from '../src/shapes/Path'
import Polygon from '../src/shapes/Polygon'
import POlyline from '../src/shapes/Polyline'
import Rect from '../src/shapes/Rect'
import Sector from '../src/shapes/Sector'
import Text from '../src/shapes/Text'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom);

function degToRad(a: number) {
  return a * Math.PI / 180;
}

const arc = new Arc({
  cx: 150,
  cy: 150,
  radius: 100,
  start: degToRad(10),
  end: degToRad(80),
  fill: 'blue',
  rotation: 0.3,
});

const circle = new Circle({
  cx: 100,
  cy: 100,
  radius: 50,
  fill: 'blue'
})

const group = new Group();

const image = new Image({
  src: 'https://lf1-hscdn-tos.pstatp.com/obj/developer-baas/baas/ttkw6x/1ddf8408cdd9f7e0_1600424925672.png',
  x: 250,
  y: 200,
  width: 100,
  height: 100,
})

const line = new Line({
  x1: 200,
  y1: 80,
  x2: 300,
  y2: 10,
  stroke: 'red',
  lineWidth: 1,
})

const rect = new Rect({
  x: 400,
  y: 400,
  width: 100,
  height: 100,
  fill: 'blue',
  fillOpacity: 0.5,
})

const polygon = new Polygon({
  fill: 'blue',
  pointList: [
    {x: 450, y: 80,},
    {x: 550, y: 50,},
    {x: 500, y: 120,},
  ]
})

const sector = new Sector({
  cx: 500,
  cy: 255,
  start: degToRad(-0),
  end: degToRad(33),
  fill: 'blue',
  radius: 120,
  radiusI: 0,
})

const text = new Text({
  x: 50,
  y: 480,
  text: '文本文本',
  fontSize: 50,
  fill: 'blue',
  textAlign: 'left',
  textBaseline: 'bottom',
})

render.add(arc);
render.add(circle)
render.add(image);
render.add(line)
render.add(rect);
render.add(polygon)
render.add(sector)
render.add(text)

render.debug();
render.resize(1200, 800);
