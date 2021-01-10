

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
});
render.add(arc);
render.debug();
