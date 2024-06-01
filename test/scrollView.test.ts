import Render from '../src/render';
import {ScrollView, Rect } from '../src'

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, {renderer: 'canvas'});



const scrollView = new ScrollView({
  x: 100,
  y: 100,
  width: 200,
  height: 200,
  scrollX: true,
  scrollY: true,
  scrollWidth: 410,
  scrollHeight: 800,
  showScrollBar: true,
  scrollBarSize: 20,
  scrollThumbColor: 'red',
  scrollThumbHoverColor: 'blue',
  scrollTrackColor: '#000',
});

scrollView.addContent(new Rect({
  x: 300,
  y:200,
  width: 100,
  height: 100,
  fill: 'red',
  stroke: 'blue',
  lineWidth: 1,
  sticky: {top: 0, bottom: 0, left: 0, right: 0}
}));
(window as any).test = scrollView;

render.add(scrollView)