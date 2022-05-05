

const rendererStorage: Record<string, DOMRenderer> = {};

export type DOMRenderer = (container: HTMLDivElement, content: unknown) => () => void;

rendererStorage.html = (dom: HTMLDivElement, content: unknown) => {
  dom.innerHTML = content + '';
  return () => {
    dom.innerHTML = '';
  }
};

rendererStorage.vue = (dom: HTMLDivElement, content: any) => {
  const vue = content.$mount(dom);
  return () => {
    vue.unmount();
  }
}

export function getDOMRenderer(type: string) {
  return rendererStorage[type];
}

export function registerDOMRenderer(type: string, renderer: DOMRenderer) {
  rendererStorage[type] = renderer;
}

export function createReactRenderer(ReactDOM: { render: Function, unmountComponentAtNode: Function }): DOMRenderer {
  return (dom: HTMLDivElement, content: unknown) => {
    ReactDOM.render(content, dom);
    return () => {
      ReactDOM.unmountComponentAtNode(dom);
    }
  }
}