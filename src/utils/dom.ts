import * as lodash from './lodash';

export function getDomContentSize(dom: HTMLElement): [number, number] {
  // todo computedStyle.width may be 100% when dom parent is not display, clientWidth return zero in that case
  const { paddingTop, paddingLeft, paddingRight, paddingBottom, width, height } = getComputedStyle(dom);
  const contentWidth = (lodash.isNumber(dom.clientWidth) ? dom.clientWidth : parseInt(width, 10)) - parseFloat(paddingLeft || '0') - parseFloat(paddingRight || '0');
  const contentHeight = (lodash.isNumber(dom.clientHeight) ? dom.clientHeight : parseInt(height, 10)) - parseFloat(paddingTop || '0') - parseFloat(paddingBottom || '0');

  return [contentWidth, contentHeight];
}