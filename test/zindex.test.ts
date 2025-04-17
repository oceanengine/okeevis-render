import { Render, Rect} from '../src'

const dom = document.getElementById('root') as HTMLDivElement
const render = new Render(dom)

for (let i = 0; i < 5; i++) {
    render.add(new Rect({
        x: 100 + i * 20,
        y: 100 + i * 20,
        width: 100,
        height: 100,
        fill: '#' + Math.random().toString().substring(2, 8),
        transitionProperty: 'all',
        transitionDuration: 300,
        transitionEase: 'linear',
        lineWidth: 0,
        hoverStyle: {
            zIndex: 1,
            lineWidth: 10,
            stroke: 'red'
        }
    }))
}