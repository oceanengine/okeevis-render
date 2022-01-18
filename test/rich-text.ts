import Render from '../src/render'
import RichText from '../src/RichText'
import Group from '../src/shapes/Group';

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

const rich = new RichText({
  rich: true,
  x: 100,
  y: 0,
  text: '<hbox borderRadius="20" borderWidth="3" borderColor="red" width="100"  height="100" background="#f7f7f7">test</hbox>',
  textAlign: 'center',
  textBaseline: 'top',
  fontSize: 12,
  fill: 'red',
  draggable: true,
});
const nextRich = new RichText({
  rich: true,
  x: 150,
  y: 0,
  text: {
    type: 'hbox',
    width: 100,
    height: 100,
    background: 'red',
    color: 'blue',
    children: ['test'],
    pack: 'center',
    onClick: e => console.log(e)
  },
  textAlign: 'center',
  textBaseline: 'top',
  fontSize: 12,
  fill: 'red',
  draggable: true,
});
const group = new Group();
group.add(nextRich);
(window as any).rich = rich;
 render.add(rich);

window.onclick = () => {
  render.updateAll([nextRich])
}