import { Render, Rect } from '../src/index'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom, {renderer: 'canvas'})
function makeRect(count: number) {
  return new Array(count).fill(0).map((value, index) => {
    return new Rect({
      x: Math.random() * 600,
      y: Math.random() * 480,
      width: 50,
      height: 50,
      fill: '#' + Math.random().toString(16).substring(2, 8),
    });
  });
}

const shapes = makeRect(100000);
shapes.forEach(shape => render.add(shape));
