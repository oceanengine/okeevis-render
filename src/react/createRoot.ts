import { ReactElement } from './types';
import Render from '../render';

export function createRoot(dom: HTMLElement) {
  const render = new Render(dom);
  return {
    render(node: ReactElement) {
      render.updateAll([node as any])
    },
    unmount() {
      render.dispose();
    },
  };
}
