import Render from '../src/render';
import ScrollView from '../src/shapes/ScrollView';
import Text from '../src/shapes/DOMNode';

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

scrollView.addContent(new Text({
  x: 100,
  y: 100,
  textAlign: 'left',
  textBaseline: 'top',
  fontSize: 40,
  text: '<div style="width: 410px;word-break: break-all">01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789</div>',
  fill: '#333',
}));
(window as any).test = scrollView;

render.add(scrollView)