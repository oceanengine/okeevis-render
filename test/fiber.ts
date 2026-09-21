import { Render, Rect } from '../src/index'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas'})
render.resize(1920, 1080)
function makeRect(count: number) {
  return new Array(count).fill(0).map((value, index) => {
    return new Rect({
      x: 1920  * index / count,
      y: Math.random() * 1080,
      width: 50,
      height: 50,
      fill: '#' + Math.random().toString(16).substring(2, 8),
      hoverStyle:{
        fill: 'red',
        zIndex: 11
      }
    });
  });
}

const shapes = makeRect(5000000);
shapes.forEach(shape => render.add(shape));
