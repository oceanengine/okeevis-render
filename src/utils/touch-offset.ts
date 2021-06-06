/**
 * from github https://github.com/Geylnu/touch-offset
 */
import * as mat3 from '../../js/mat3';
import { transformMat3 } from './vec2';

function isDomHasTransform(dom: HTMLDivElement) {
  let node = dom;
  while (node) {
    const { transform } = getComputedStyle(node);
    if (transform !== 'none') {
      return true;
    }
    node = node.parentElement as HTMLDivElement;
  }
  return false;
}

/**
 * 移动端事件缺乏offsetX offsetY, 需要自己计算
 * 目前有两种办法
 * 1. 根据父节点的矩阵层层计算
 * 2. zrender做法, 在四个角落插入0*0的div, 根据client矩阵和四个div的offsetParent得到的坐标, 计算出二者转换的矩阵
 * @param x pageX
 * @param y pageY
 * @param elOrCache 
 */

 function getTranformData(el: HTMLDivElement) {
  let style = window.getComputedStyle(el);
  let transform = style.transform;
  let transformOrigin = style.transformOrigin;

  let origin = { x: 0, y: 0 };
  let matrix = mat3.create();
  if (transform !== 'none') {
    let originArray = transformOrigin.split(' ');
    origin.x = parseInt(originArray[0]);
    origin.y = parseInt(originArray[1]);

    let matrixString = transform.match(/\(([^)]*)\)/)[1];
    const [a, b, c, d, e, f] = matrixString.split(',').map(parseFloat);
    const temp = mat3.fromValues(a, b, 0, c, d, 0, e, f, 1);
    matrix = mat3.invert(matrix, temp);
  }
  return { matrix, origin };
}

function getVertexPosition(el: HTMLDivElement) {
  let currentTarget = el;
  let top = 0;
  let left = 0;
  while (currentTarget !== null) {
    top += currentTarget.offsetTop;
    left += currentTarget.offsetLeft;
    currentTarget = currentTarget.offsetParent as HTMLDivElement;
  }
  return { top, left };
}

export function getTouchOffsetPosition(elOrCache: HTMLDivElement, event: Touch): {x: number, y: number} {
  const { pageX, pageY, clientX, clientY} = event;
  let x = pageX;
  let y = pageY;
  const hasTransform = isDomHasTransform(elOrCache);
  if (!hasTransform) {
    const { left, top } = elOrCache.getBoundingClientRect();
    return { x: clientX - left, y: clientY - top };
  }
  
  function computPosition(data: any[]) {
    data.forEach(obj => {
      let {
        temp,
        origin,
        vertex: { left, top },
      } = obj;
      x = x - left - origin.x;
      y = y - top - origin.y;
      let result = transformMat3([0, 0], [x, y], temp);
      x = result[0] + origin.x;
      y = result[1] + origin.y;
    });
    return { x, y };
  }

  let data = [];
  let el = elOrCache;
  while (el !== null && el.nodeType === 1) {
    let { left, top } = getVertexPosition(el);
    let transformData = getTranformData(el);
    let temp = transformData.matrix;
    let origin = transformData.origin;

    if (data.length > 0) {
      data[0].vertex.left -= left;
      data[0].vertex.top -= top;
    }
    data.unshift({
      temp,
      origin,
      vertex: {
        left,
        top,
      },
    });
    el = el.parentNode as HTMLDivElement;
  }
  let pos = computPosition(data);
  return { x: pos.x, y: pos.y };
}
