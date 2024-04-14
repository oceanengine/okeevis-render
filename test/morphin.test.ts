import Render from '../src/render'
import {Rect, Sector, Circle, Polygon, Line  } from '../src'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {workerEnabled: true})
render.enableDirtyRect = false;


const line = new Line({
  x1: 0,
  y1: 0,
  x2:300,
  y2: 300,
});

const rect = new Rect({
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill: 'blue',
  draggable: true,
  borderRadius: 0,
});

const rectWithRadius = new Rect({
  x: 200,
  y: 100,
  width: 200,
  height: 150,
  fill: 'blue',
  draggable: true,
  borderRadius: 80,
});

const polygon = new Polygon({
  pointList: [
    {x: 10, y: 10},
    {x: 100, y: 10},
    {x: 100, y: 200},
    {x: 100, y: 200},
    {x: -10, y: 200},
  ],
  stroke: 'blue',
  draggable: true,
  fill: 'red',
  lineWidth: 2,
  borderRadius: 3,
});
const sector = new Sector({
    cx: 150,
    cy: 150,
    radius: 50,
    fill: 'blue',
    start: 0,
    end: Math.PI * 1.1,
})
const circle = new Circle({
  cx: 150,
  cy: 150,
  radius: 100,
});

// rect.stopAllAnimation().setAttr({scaleX: 0, scaleY: 0}).animateTo({scale: [2, 2]})

render.add(polygon);

const newnode = polygon.animateMorphing(rect.getPathData(), 5000)
setTimeout(() => {
  newnode.animateMorphing(sector.getPathData(), 5000);
}, 5000);


;(window as any).render = render;