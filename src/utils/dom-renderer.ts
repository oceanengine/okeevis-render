

const rendererStorage: Record<string, DOMRenderer> = {};



export type DOMRenderer = {
  update: (dom: HTMLDivElement, content: unknown) => void;
  destroy: (dom: HTMLDivElement) => void;
}

rendererStorage.html = {
  update: (dom, content) => dom.innerHTML = content + '',
  destroy: dom => dom.innerHTML = '',
}

export function getDOMRenderer(type: string) {
  return rendererStorage[type];
}

export function registerDOMRenderer(type: string, renderer: DOMRenderer) {
  rendererStorage[type] = renderer;
}

export function createReactRenderer(ReactDOM: { render: Function, unmountComponentAtNode: Function }): DOMRenderer {
  return {
    update: (dom, content) => ReactDOM.render(content, dom),
    destroy: dom => ReactDOM.unmountComponentAtNode(dom),
  }
}