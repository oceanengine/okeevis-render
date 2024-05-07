import { ReactNode } from './types';

export function map<T>(children: ReactNode, callback: (child: ReactNode) => T) {
  return getFlatChildren(normalizeToArray(children)).map(callback);
}

export function forEach<T>(children: ReactNode, callback: (child: ReactNode) => void) {
  return getFlatChildren(normalizeToArray(children)).forEach(callback);
}

export function toArray(children: ReactNode): ReactNode[] {
  return getFlatChildren(normalizeToArray(children));
}

function normalizeToArray(node: ReactNode): ReactNode[] {
  return Array.isArray(node) ? node : [node];
}

function getFlatChildren(nodes: any[], out: Element[] = []) {
  nodes.forEach(node => {
    if (Array.isArray(node)) {
      getFlatChildren(node, out);
    } else {
      out.push(node);
    }
  });
  return out;
}
