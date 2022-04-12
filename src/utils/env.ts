const isBrowser = typeof document !== 'undefined' && document.toString().indexOf('HTMLDocument') !== -1;
const _isMobile =  isBrowser && typeof window !== 'undefined' && 'ontouchstart' in window;
const isPC = isBrowser && !_isMobile;
const isMobile = !isPC;

export {
  isBrowser,
  isMobile,
  isPC
}