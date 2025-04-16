import Render from '../src/render'
import Circle from '../src/shapes/Circle'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas'})
const shape = new Circle({
  cx: 150,
  cy: 150,
  radius: 50,
  fill: 'blue',
  stroke: 'red',
  lineWidth: 20,
  transitionProperty: 'all',
  transitionDuration: 1000,
  onAnimationStart: () => console.log('animationstart'),
  onAnimationEnd: () => console.log('animationend'),
  hoverStyle: {
    fill: 'yellow',
  }
});
render.on('mousemove', e =>{
  shape.animate(
    {
      cx: e.x,
      cy: e.y,
    }
  , { duration: 500, fill: "forwards" },)
})
// let count = 0;
// const animation = shape.animate([
//   {
//     fill: 'yellow',
//     translateX: 0,
//   },
//   {
//     fill: 'red',
//     translateX: 100,
//   },
// ], {
//   duration: 300,
//   iterations: 2,
//   direction: 'alternate',
//   playbackRate: 1,
//   easing: 'ease-in',
//   delay: 1000,
//   fill: 'none'
// });


render.add(shape);(window as any).shape = shape;