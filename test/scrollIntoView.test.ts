import Render from '../src/render';
import {ScrollView, Rect, Text } from '../src'

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, {renderer: 'canvas'});



const scrollView = new ScrollView({
  x: 0,
  y: 0,
  width: 844,
  height: 390,
  scrollX: true,
  scrollY: true,
  scrollWidth: 810,
  scrollHeight: 4000,
  showScrollBar: true,
});


for (let i = 0; i < 100; i++) {
  scrollView.addContent(new Text({
    x: 300,
    y: i * 40 + 10,
    text: 'line ' + (i + 1),
    fill: '#000',
    fontSize: 12,
    textAlign: 'center',
    textBaseline: 'top',
    stateStyles:{
      hover: {
        fill: 'red'
      }
    }
  }))
}


render.add(scrollView);
(window as any).render = render;