import Render from '../src/render'
import Group from '../src/shapes/Group';
import CompoundPath from '../src/shapes/CompoundPath';
import Circle from '../src/shapes/Circle';
import Polyline from '../src/shapes/Polyline';
import Path from '../src/shapes/Path';
import Line from '../src/shapes/Line';

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom);


const group1 = new Group({})

const group2 = new Group({})


const shape1 = new Circle({});
const shape2 = new Circle({});

const shape3 = new Circle({

})

const shape4 = new Circle()