import Render from '../src/render';
import {ScrollView, Rect } from '../src'

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, {renderer: 'canvas'});



const scrollView = new ScrollView({
  className: 'scrollView',
  x: 100,
  y: 100,
  width: 200,
  height: 200,
  scrollX: true,
  scrollY: true,
  scrollWidth: 410,
  scrollHeight: 800,
  showScrollBar: 'scrolling',
  scrollBarSize: 20,
  scrollThumbColor: 'red',
  scrollThumbHoverColor: 'blue',
  scrollTrackColor: '#000',
  onScroll: () => console.log('scrolled')
});

const nestScrollView = new ScrollView({
  className: 'nestScrollView',
  x: 100,
  y: 10,
  width: 300,
  height: 400,
  scrollX: true,
  scrollY: true,
  scrollWidth: 410,
  scrollHeight: 800,
  onScroll: () => console.log('nest scrolled'),
  showScrollBar: 'scrolling',
});

nestScrollView.addContent(scrollView);

scrollView.addContent(new Rect({
  x: 300,
  y:200,
  width: 100,
  height: 100,
  fill: 'red',
  stroke: 'blue',
  lineWidth: 1,
  sticky: {top: -10, bottom: -10, left: 10, right: 10},
}));
(window as any).test = nestScrollView;

render.add(nestScrollView)