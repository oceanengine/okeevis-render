import { ReactNode } from './types';
import Render from '../render';

export function createRoot(dom: HTMLElement) {
  const render = new Render(dom);
  return {
    render(node: ReactNode) {
      render.updateAll([node as any])
    },
    unmount() {
      render.dispose();
    },
  };
}
