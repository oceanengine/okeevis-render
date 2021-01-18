import Render from '../src/render'
import Path from '../src/shapes/Path'
// import Path2D from '../src/geometry/Path2D'
// import Arc from '../src/shapes/Arc'
// https://spritejs.org/demo/#/svg_path

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

// const outterFirePaths = [
//   'M19.8,22.3C15.3,23.1,6.5,33.4,6.5,33.4c-0.7,0.4-1.6,0.2-2-0.5c-0.1-0.2-0.2-0.3-0.2-0.5L1.4,15.7C0.2,8.6,4.9,1.8,12,0.6c7.1-1.2,13.8,3.5,15.1,10.6C28,16.6,24.9,21.3,19.8,22.3z',
//   'M21,24.6L6.5,33.4c-0.7,0.4-1.6,0.2-2-0.5c-0.1-0.2-0.2-0.3-0.2-0.5L1.4,15.7C0.2,8.6,4.9,1.8,12,0.6c7.1-1.2,13.8,3.5,15.1,10.6C28,16.6,25.4,21.9,21,24.6z',
//   'M23.4,21.4l-11,11.9c-0.5,0.6-1.4,0.6-2,0.1c-0.1-0.1-0.2-0.3-0.3-0.4L3,18.3C0,12.1,2.6,4.6,8.8,1.7c6.2-3,13.7-0.4,16.7,5.8C27.8,12.2,26.7,17.7,23.4,21.4',
//   'M23.6,21.4l-11.2,12c-0.5,0.6-1.4,0.6-2,0.1c-0.1-0.1-0.2-0.3-0.3-0.4c0,0-2.3-9.1-7.1-14.8C-1.5,12.9,2.6,4.4,8.9,1.4c6.3-3,13.8-0.4,16.8,5.9C28,12.1,27,17.7,23.6,21.4z',
// ];
// const innerFirePaths = [
//   'M17.3,18c-5.1,1.5-8.4,7.9-8.4,7.9c-0.6,0.4-1.3,0.3-1.8-0.2c-0.2-0.2-0.3-0.5-0.3-0.8L6.7,10.3c0-4.8,3.8-8.6,8.5-8.7c4.8,0,8.6,3.8,8.7,8.5C24,13,19.8,17.3,17.3,18z',
//   'M20.5,17.1L8.8,25.9c-0.6,0.4-1.3,0.3-1.8-0.2c-0.2-0.2-0.3-0.5-0.3-0.8L6.7,10.3c0-4.8,3.8-8.6,8.5-8.7c4.8,0,8.6,3.8,8.7,8.5C23.9,13,22.6,15.5,20.5,17.1z',
//   'M21.6,12.8l-6,12.7c-0.3,0.6-1,0.9-1.6,0.6c-0.2-0.1-0.4-0.3-0.6-0.5L6.8,13.2c-2.1-4-0.6-9,3.4-11.1c4-2.1,9-0.6,11.1,3.4C22.6,7.8,22.6,10.6,21.6,12.8z',
//   'M21.7,12.7l-6,12.8c-0.3,0.6-1,0.9-1.6,0.6c-0.2-0.1-0.4-0.3-0.6-0.5c0,0-2.3-8-6.6-12.5C3.7,9.8,6.2,4,10.3,1.8c4.1-2.2,9.1-0.6,11.3,3.4C22.8,7.6,22.8,10.4,21.7,12.7z',
// ];

// const path1 = Path.fromSvgPath(
//   outterFirePaths[0],
//   {
//     stroke: 'rgba(0,255,0,0.2)',
//     lineWidth:1,
//   }
// );

// const path2 = Path.fromSvgPath(
//   innerFirePaths[0],
//   {
//     stroke: 'rgba(0,0,255,0.2)',
//     lineWidth:1,
//   }
// );
const path1 = new Path({
  brush: ctx => {
    // ctx.moveTo(50, 50);
    ctx.moveTo(20, 20);
    ctx.lineTo(100, 100);
    ctx.lineTo(200, 100);
    ctx.arc(150, 150, 50 , 0, Math.PI, false);
    ctx.closePath();
  },
stroke: 'rgba(0,255,0,0.2)',
lineWidth:1,
})

const path2 = new Path({
  // pathData: outterFirePaths,
  brush: ctx => {
    // ctx.moveTo(50, 50);
    ctx.moveTo(50, 50);
    ctx.lineTo(100, 100);
    ctx.lineTo(200, 100);
    ctx.arc(200, 200, 80 , 0, Math.PI, false);
    ctx.closePath();
  },
  stroke: 'rgba(0,0,255,0.2)',
  lineWidth:1,
})

const path = new Path({
  // pathData: outterFirePaths,
  brush: ctx => {
    // ctx.moveTo(50, 50);
    ctx.moveTo(20, 20);
    ctx.lineTo(100, 100);
    ctx.lineTo(200, 100);
    ctx.arc(150, 150, 50 , 0, Math.PI, false);
    ctx.closePath();
  },
  stroke: 'red',
  lineWidth:1,
})

// const path = Path.fromSvgPath(
//   outterFirePaths[0],
//   {
//     stroke: 'red',
//     lineWidth:1,
//   }
// );
// const newPath = new Path2D(innerFirePaths[0]);
// path.animateTo({
//   pathData: newPath
// }, 1000, 'linear')

path.animateTo({
  brush: ctx => {
    ctx.moveTo(50, 50);
    ctx.lineTo(100, 100);
    ctx.lineTo(200, 100);
    ctx.arc(200, 200, 80 , 0, Math.PI, false);
    ctx.closePath();
  },
}, 1000)

render.add(path1);
render.add(path2);
render.add(path)



render.resize(1200, 800);