import Render from '../src/render';
import ScrollView from '../src/shapes/ScrollView';
import Text from '../src/shapes/Text';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, {renderer: 'svg'});



const scrollView = new ScrollView({
  x: 0,
  y: 0,
  width: 100,
  height: 40,
  scrollX: true,
  scrollY: true,
  scrollWidth: 1000,
  scrollHeight: 40,
});

scrollView.addContent(new Text({
  x: 0,
  y: 0,
  textAlign: 'left',
  textBaseline: 'top',
  fontSize: 40,
  text: '0123456789012345678901234567890123456789012345678901234567890123456789',
  fill: '#333'
}));
(window as any).test = scrollView;

render.add(scrollView)