import {Render, Rect, Circle, Arc, TextPath, Image, Text, Polyline, Polygon, Path, CompoundPath, } from '../src';
import { PluginRoughCanvas } from '../src/plugins/PluginRoughCanvas';
const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, { renderer: 'canvas' });

render.addPlugin(new PluginRoughCanvas());

const rect = new Rect({
  x: 10,
  y: 10,
  width: 100,
  height: 100,
  fill: 'red',
  stroke: 'blue',
  lineWidth: 2,
  draggable: true,
  shadowBlur: 10,
  shadowColor: 'red',
  r: 10,
  roughOptions:{
    fillStyle: 'cross-hatch',
    hachureAngle: 0,
  },
  onClick: e => console.log(e)
});
const text = new Text({
  text: 'test',
  fontSize: 40,
  fill: 'blue',
  x: 200,
  y: 200,
})


const img = new Image({
  x: 330,
  y: 330,
  width: 200,
  height: 358,
  showBBox: true,
  src: './test.png',
  preserveAspectRatio: 'xMidYMin',
})


const path = Path.fromSvgPath('M 50, 50 L 300 50 L 200 240');
const pathline = new Polyline({
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
    path: pathline,
    text: '12345678901234567890123456789',
    fill: 'red',
    fontSize: 12,
    draggable: true,
    startOffset: 0,
    translateX: 50,
    translateY: 50,
})

const circle = new Circle({
  cx: 400,
  cy: 150,
  radius: 150,
  fill: 'blue',
  stroke: 'red',
  lineWidth: 1,
  draggable: true,
  roughOptions: {
    fillWeight: 1,
    fillLineDash: [5],
    strokeWidth: 10,
    fillLineDashOffset: 0,
    fillStyle: 'cross-hatch',
    hachureAngle: 0,
  },
  onClick: e => e.target.setAttr('fill',  '#' + Math.random().toString(16).substr(2, 6))
})

const polyline = new Polyline({
  draggable: true,
  pointList: [
    {x: 0, y: 0,},
    {x: 100, y: 0,},
    {x: 100, y: 100,},
    {x: 259, y: 100,},
    {x:150, y: 200,},
  ],
  translateX: 50,
  translateY: 50,
  lineWidth: 1,
  borderRadius: 10,
  fill: 'transparent',
  stroke: 'blue'
})

const polygon = new Polygon({
  pointList: [
    {x: 10, y: 10},
    {x: 100, y: 10},
    {x: 100, y: 200},
    {x: 100, y: 200},
  ],
  translateY: 300,
  stroke: 'blue',
  draggable: true,
  fill: 'red',
  borderRadius: 10,
  lineWidth: 2,
})

render.addAll([rect, circle, polyline, polygon, text, tp, img]);