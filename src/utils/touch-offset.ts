/**
 * inspired by zrender https://github.com/ecomfe/zrender/blob/master/src/core/dom.ts
 * The algoritm is learnt from
 * https://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
 * And we made some optimization for matrix inversion.
 * Other similar approaches:
 * "cv::getPerspectiveTransform", "Direct Linear Transformation".
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

const DOM_PROPERTY = '__lightrendermarkers';

export function getTouchOffsetPosition(
  dom: HTMLDivElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const hasTransform = isDomHasTransform(dom);
  const { left, top } = dom.getBoundingClientRect();
  if (!hasTransform) {
    return { x: clientX - left, y: clientY - top };
  }
  if (!(dom as any)[DOM_PROPERTY]) {
    (dom as any)[DOM_PROPERTY] = {};
  }
  const info = (dom as any)[DOM_PROPERTY] as { rects: HTMLDivElement[] };
  if (!info.rects) {
    appendRects(dom, info);
  }
  const [a1, a2, a3] = info.rects.map(rect => rect.getBoundingClientRect());
  const [b1, b2, b3] = info.rects.map(rect => {
    return { left: rect.offsetLeft, top: rect.offsetTop };
  });
  const matrixClient = mat3.fromValues(a1.left, a1.top, 1, a2.left, a2.top, 1, a3.left, a3.top, 1);
  const invertedMatrixed = mat3.invert(mat3.create(), matrixClient);
  if (!invertedMatrixed) {
    return { x: clientX - left, y: clientY - top };
  }
  const matrixSource = mat3.fromValues(b1.left, b1.top, 1, b2.left, b2.top, 1, b3.left, b3.top, 1);
  const matrix = mat3.multiply(mat3.create(), matrixSource, invertedMatrixed);
  const result = [clientX, clientY] as any;
  transformMat3(result, result, matrix);
  return { x: result[0], y: result[1] };
}

function appendRects(dom: HTMLDivElement, info: any) {
  const rects = [
    ['0px', '0px'],
    ['100%', '0px'],
    ['100%', '100%'],
  ];
  info.rects = [];
  rects.forEach(rect => {
    const [left, top] = rect;
    const div = document.createElement('div');
    div.style.cssText = `
      position: absolute;
      visibility: hidden;
      padding: 0;
      margin: 0;
      border-width: 0;
      width: 0;
      height: 0;
      left: ${left};
      top: ${top};
    `;
    dom.appendChild(div);
    info.rects.push(div);
  });
}
