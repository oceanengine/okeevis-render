import { parseCssGradient } from '../src/color/css-gradient-parser';
import {Render, Use, Rect} from '../src'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const rect = new Rect({
  x: 100,
  y: 100,
  width: 454,
  height: 268,
  stroke: 'red',
  lineWidth: 0,
  draggable: true,
  fill: [
    'linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%)', 
    'linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%)', 
    'linear-gradient(336deg, rgba(0,0,255,.8), rgba(0,0,255,0) 70.71%)'
  ],
  stateStyles:{
    hover: {
      fill: 'red'
    }
  }
});
(window as any).rect = rect;
// const use = new Use({
//   shape: rect,
//   fill: 'linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%)',
// });

// const use2 = new Use({
//   shape: rect,
//   draggable: true,
//   fill: 'linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%)',
//   blendMode: 'lighten',
// })
// const use3 = new Use({
//   shape: rect,
//   draggable: true,
//   fill: 'linear-gradient(336deg, rgba(0,0,255,.8), rgba(0,0,255,0) 70.71%);',
//   blendMode: 'lighten',
// })


render.addAll([rect]);


// parseCssGradient('linear-gradient(red, blue)');

// parseCssGradient('linear-gradient(red, blue)');

// parseCssGradient('linear-gradient(180deg, red, blue)');

// parseCssGradient('linear-gradient(180deg , red , blue)');

// parseCssGradient('linear-gradient(1turn , red, blue)');

// parseCssGradient('linear-gradient(to left, red, blue)');

// parseCssGradient('linear-gradient(to left , red, blue)');

// parseCssGradient('linear-gradient(-135deg, red, blue)'));

// parseCssGradient('linear-gradient(to top left , red, blue)');

// parseCssGradient('linear-gradient(to top left , red 20%, blue 100%)');

// parseCssGradient('linear-gradient(to top left , rgb(255, 255, 255) 20%, blue 100%)');