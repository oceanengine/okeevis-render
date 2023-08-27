import { Render, Circle, Polyline, Polygon } from '../src';

const dom = document.getElementById('root') as HTMLDivElement;
const render = new Render(dom);
const points = [
    [72, 356],
    [174, 228],
    [219, 115],
    [362, 110],
    [437, 327],
];

const polyline = new Polyline({
    pointList: [],
    smooth: true,
    smoothMonotone: 'x',
    lineWidth: 1,
    stroke: 'red'
});
render.add(polyline);

function refreshLine() {
    polyline.setAttr('pointList', points.map(point => {
        return {
            x:point[0],
            y: point[1]
        }
    }))
}
refreshLine();

points.forEach((point ,index) => {
    render.add(new Circle({
        cx: point[0],
        cy: point[1],
        radius: 15,
        fill: 'blue',
        opacity: 0.5,
        lineWidth: 1,
        stroke: 'red',
        draggable: true,
        onDrag:e => {
            points[index][0] += e.dx;
            points[index][1] += e.dy;
            refreshLine();
        }
    }))
})


