import { parseCssGradient } from '../src/color/css-gradient-parser';
import Render from '../src/render'
import Rect from '../src/shapes/Rect'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const rect = new Rect({
  x: 100,
  y: 100,
  width: 394,
  height: 268,
  fill: 'linear-gradient(45deg,red, blue)',
  stroke: 'red',
  lineWidth: 0,
  draggable: true,
  stateStyles:{
    hover: {
      fill: 'red'
    }
  }
});

render.add(rect);


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