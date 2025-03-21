import { Render, Path, Circle, Line} from '../src'
import { pointDistanceToBezier } from '../src/geometry/contain/bezier';
import Path2D from '../src/geometry/Path2D';
import { selfIntersection } from '../src/geometry/intersection/self-intersection'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom);

const p1 = [10, 300];
const p2 = [10, 80];
const p3 = [80, 20];
const p4 = [300, 10];
const l1 = [30, 30];
const l2 = [300, 300];
const intersectionPoints: Circle[] = [];
const circle = new Circle({
    cx: 0,
    cy: 0,
    radius: 0,
    stroke: 'red',
    lineWidth: 1,
    pointerEvents: 'none'
})

render.add(circle);
const intersectionCircle = new Circle({
    cx: 0,
    cy: 0,
    radius: 0,
    fill: 'red',
});
render.add(intersectionCircle);

render.on('mousemove', e => {
    const x = e.x;
    const y = e.y;
    const distance = pointDistanceToBezier(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], p4[0], p4[1],x,y);
    circle.setAttr({
        cx: x,
        cy: y,
        radius: distance,
    })
})

const getPath = () => {
    const path = new Path2D();
    path.moveTo(p1[0], p1[1]);
    path.bezierCurveTo(p2[0], p2[1], p3[0], p3[1], p4[0], p4[1]);
    const roots = selfIntersection(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], p4[0], p4[1]);
    roots.forEach(p => {
        const point = path.getPointAtPercent(p);
        intersectionCircle.setAttr({ 
            cx: point.x,
            cy: point.y,
            radius: 10,
        })
    })    
    return path;
}

const path = new Path({
    pathData: getPath(),
    stroke: 'red',
    fill: 'red',
    fillOpacity: .2,
    lineWidth: 2,
    stateStyles: {
        hover: {
            stroke: 'blue'
        }
    }
});
const line = new Line({
    x1: l1[0],
    y1: l1[1],
    x2: l2[0],
    y2: l2[1],
    stroke: 'red',
    lineWidth: 1,
});
render.add(line);

function updateIntersection() {
    const pathData = getPath();
    path.setAttr('pathData', pathData);
    intersectionPoints.forEach(p => render.remove(p));
    intersectionPoints.length = 0;
    const intersections: any[] = [];
    intersections.forEach(p => {
        const circle = new Circle({
            cx: p[0],
            cy: p[1],
            radius: 10,
            fill: 'red',
        });
        render.add(circle);
        intersectionPoints.push(circle);
    })
}

[p1, p2, p3, p4, l1, l2].forEach(p => {
    const circle = new Circle({
        cx: p[0],
        cy: p[1],
        radius: 10,
        fill: 'blue',
        draggable: true,
        onDrag: (e) => {
            p[0] += e.dx;
            p[1] += e.dy;
            const pathData = getPath();
            path.setAttr('pathData', pathData);
            line.setAttr('x1', l1[0]);
            line.setAttr('y1', l1[1]);
            line.setAttr('x2', l2[0]);
            line.setAttr('y2', l2[1]);
            updateIntersection();
        }
    });
    render.add(circle);
})

render.add(path);
updateIntersection();