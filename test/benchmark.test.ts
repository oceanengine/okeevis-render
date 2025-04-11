import { Render, Rect, } from '../src/index'
import { getScheduler } from '../src/multi-thread/scheduler';
import { registerFeature } from '../src/utils/featureManager';
registerFeature('worker', getScheduler);
const dom = document.getElementById('root') as HTMLDivElement
dom.style.cssText = 'width: 1000px;height: 404px;border: 1px solid #000;'
const render = new Render(dom, {workerEnabled: false});
let pause = false;
render.on('click', () => {
  pause = !pause;
  render.requestAnimationFrame(onTick)
});
render.enableDirtyRect = false;
render.showFPS = true;
const width = 1000;
const height =  404;
const count = 32000;
const rects: any[]= [];
for (let i = 0; i < count; i++) {
  const x = Math.random() * width;
  const y = Math.random() * height;
  const size = 10 + Math.random() * 40;
  const speed = 1 + Math.random();

  const rect = new Rect({
    width: size,
    height: size,
    fill: "#fff",
    stroke: "black",
    lineWidth: 1,
    x,
    y,
  });
  render.add(rect);
  rects[i] = { x, y, size, speed, el: rect };
}

function onTick() {
    const rectsToRemove = [];
    for (let i = 0; i < count; i++) {
      const rect = rects[i];
      rect.x -= rect.speed;
      rect.el.attr.x = rect.x;
      rect.el.dirty();
      if (rect.x + rect.size < 0) rectsToRemove.push(i);
    }
    rectsToRemove.forEach((i) => {
      rects[i].x = width + rects[i].size / 2;
    });
    if (!pause) {
      render.requestAnimationFrame(onTick)
    }
}
render.requestAnimationFrame(onTick)