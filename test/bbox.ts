

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

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'svg'});
render.showBBox = false
render.showBoundingRect = false;
render.enableDirtyRect = true;
render.showFPS = true;
(window as any).renderer = render;
function degToRad(a: number) {
  return a * Math.PI / 180;
}
const arcColor = '#5771c0'
const arc = new Arc({
  cx: 150,
  cy: 150,
  radius: 100,
  start: degToRad(10),
  end: degToRad(80),
  fill: arcColor,
  rotation: 0.3,
});

const clipRect = new Rect({x: 0, y: 0, width: 100, height: 100})


const circle = new Circle({
  draggable: true,
  cursor: 'pointer',
  cx: 100,
  cy: 100,
  radius: 50,
  clip:clipRect,
  fill: new RadialGradient({
    cx: 0.5,
    cy: 0.5,
    r: 1,
    stops: [
      {
        offset: 0,
        color: 'red'
      },
      {
        offset: 1,
        color: 'blue',
      }
    ]
  })
})


const image = new Image({
  draggable: true,
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
  stroke: 'blue',
  lineWidth: 2,
})

const rect = new Rect({
  draggable: true,
  x: 400,
  y: 400,
  width: 100,
  height: 100,
  fillOpacity: 1,
  lineWidth: 10,
  stroke: '#333',
  origin: [450, 450],
  rotation: 0.2,
  scale: [3, 3],
  shadowBlur: 20,
  shadowColor: 'red',
  shadowOffsetX: 20,
  shadowOffsetY: 20,
  onClick: e => {
    // circle.setAttr('clip', null)
    arc.animateTo({fill: brighten(arcColor, 0.5)});
    e.target.parentNode.add(e.target)
    clipRect.animateTo({x: 550}, 4000)
    path.animateTo({fill: 'rgba(255, 0, 0, .1)'}, 800)
    rect.animateTo({fill: new LinearGradient({
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 1,
      stops: [{
        offset: 0,
        color: 'green'
      }, {
        offset: 1,
        color: 'yellow'
      }]
    })})
    // group.firstChild.setAttr({fill: 'gray'})
  },
  fill: new LinearGradient({
    x1: 0,
    y1: 0,
    x2: 1,
    y2: 0,
    stops: [
      {
        offset: 0,
        color: 'red',
      },
      {
        offset: 1,
        color: 'blue'
      }
    ]
  })
})


rect.animateTo({rotation: degToRad(360)}, 5000)

const polygon = new Polygon({
  fill: 'blue',
  pointList: [
    {x: 450, y: 80,},
    {x: 550, y: 50,},
    {x: 500, y: 120,},
  ]
})

const sector = new Sector({
  draggable: true,
  cx: 500,
  cy: 255,
  radius: 100,
  radiusI: 20,
  start: degToRad(-30),
  end: degToRad(27),
  fill: 'blue',
})


const text = new Text({
  x: 50,
  y: 480,
  text: '文本文本',
  fontSize: 50,
  lineHeight: 50,
  fill: 'blue',
  lineWidth: 4,
  stroke: '#333',
  textAlign: 'left',
  textBaseline: 'bottom',
})

const path = new Path({
  draggable: true,
  fill: 'blue',
  lineWidth: 4,
  stroke: '#333',
  brush: ctx => {
    ctx.moveTo(20, 20);
    ctx.lineTo(100, 100)
    ctx.bezierCurveTo(20, 100, 200, 100, 200, 20);
    ctx.closePath();
  },
  rotation:degToRad(45),
  position: [200, 200],
  origin:[100, 80],
})

const group = new Group({
  origin: [300, 300],
  rotation: degToRad(0)
});


// group.setAttr({scale: [0, 0]}).animateTo({scale: [3, 3]}, 50000)

group.add(arc);
group.add(circle)
group.add(image);
group.add(line)
group.add(rect);
group.add(polygon)
group.add(sector)
group.add(text)
group.add(path)

const patternImage = new window.Image();
patternImage.width = 50;
patternImage.height = 50;
patternImage.src = 'https://lf1-hscdn-tos.pstatp.com/obj/developer-baas/baas/ttkw6x/1ddf8408cdd9f7e0_1600424925672.png'
group.prepend(new Rect({
  x: 0,
  y: 0,
  width: 600,
  height: 600,
  fill: new Pattern({
    image: patternImage,
    repeat: 'repeat',
  })
}))

// document.onclick = () => {
//   group.add(new Rect({
//     fill: 'none',
//     stroke: 'blue',
//     lineWidth: 4,
//     x: Math.random() * 1000,
//     y: Math.random() * 800,
//     width: 100,
//     height: 100,
//   }))
// }

render.add(group)
// render.resize(1200, 800);
function makeText(count: number) {
  return new Array(count).fill(0).map((value, index) => {
    return new Text({
      x: Math.random() * 400,
      y: Math.random() * 600,
      fill: 'blue',
      text: index + '',
    });
  });
}