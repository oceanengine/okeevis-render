import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Render from '../src/render';
import DOMNode from '../src/shapes/DOMNode';
import Text, { TextAttr } from '../src/shapes/Text';
import ScrollView from '../src/shapes/ScrollView';
import { registerDOMRenderer, createReactRenderer } from '../src/utils/dom-renderer';

registerDOMRenderer('react', createReactRenderer(ReactDOM));



const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom, { renderer: 'canvas' });

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
});

const textconfig: TextAttr = {
  x: 100,
  y: 100,
  text: `<p><button>test</button><input type="checkbox" />`,
  fill: '#333',
  originX: 100,
  originY: 100,
  fontSize: 24,
  textAlign: 'left',
  textBaseline: 'middle',
  scaleX: 2,
  scaleY: 2,
  rotation: Math.PI / 8,
};

const reactnode = new DOMNode({
  x: 200,
  y: 50,
  textAlign: 'left',
  textBaseline: 'top',
  text: <div style={{height: 300, width: 300, border: "1px solid red"}} />,
  renderer: 'react',
});


const html = new DOMNode({
  ...textconfig,
  fill: 'red',
});

const text = new Text({
  ...textconfig,
});

scrollView.addContent(html);
scrollView.addContent(reactnode);
render.add(scrollView);
(window as any).html = html;
(window as any).react = reactnode;
