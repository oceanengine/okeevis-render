import Render from '../src/render';
import Text from '../src/shapes/Text';
import Group from '../src/shapes/Group';
import Rect from '../src/shapes/Rect';
import Line from '../src/shapes/Line';
import Circle from '../src/shapes/Circle';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, {renderer: 'canvas'});


const list1 = [

  new Text({key: 'item-2'}),
  new Text({key: 'item-1'})
]

const list2 = [
  new Text({key: 'item-1'}),
  new Text({key: 'item-3'}),
  new Text({key: 'item-2'})
]
render.addAll(list1)
render.updateAll(list2)