import { ReactNode } from './types';
import Group from '../shapes/Group';

export function createRoot(root: Group) {
  return {
    render(node: ReactNode) {
      root.updateAll([node as any])
    },
    unmount() {
      root.clear();
    },
  };
}
