const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(600, 480);


const {Render, Circle, Sector, } = require('../lib/index')
const render = new Render(canvas, {dpr: 2})
render.add(new Circle({
  cx: 100,
  cy: 100,
  radius: 50,
  fill: 'red'
}))

render.add(new Sector({
  cx: 300,
  cy: 300,
  radius:100,
  radiusI: 30,
  start: 0,
  end: Math.PI * 2,
  fill: 'blue'
}))

const fs = require('fs')
const path = require('path')
render.refreshImmediately()
fs.writeFileSync(path.resolve(__dirname, './test.png'), canvas.toBuffer())
render.dispose()