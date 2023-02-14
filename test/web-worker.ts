import {Render, Text, Rect, Circle, } from '../src/index'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom);

const rect = new Rect({
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill: 'blue',
  stroke: 'red',
  lineWidth: 20,
  opacity: 0.5,
  borderRadius: 10,
});
const text = new Text({
  text: 'web canvas test',
  x: 100,
  y: 200,
  fontSize: 50,
  fontFamily: 'serif',
  textAlign: 'left',
  textBaseline: 'top',
  fill: 'red',
  stroke: 'blue',
  rotation: Math.PI/ 14,
  lineWidth: 4,
})

const circle =  new Circle({
  cx: 300,
  cy: 300,
  radius: 50,
  fill: 'blue',
  shadowColor: 'red',
  shadowBlur: 100,
  shadowOffsetX: 50,
  shadowOffsetY: 50,
  stroke: 'red',
  lineWidth: 10,
  lineDash: [5],
})

render.add(rect);
render.add(text);
render.add(circle);
(window as any).render = render;