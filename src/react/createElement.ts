import { ReactNode, FunctionComponent } from './types';
import Element from '../shapes/Element';
import { HookElement } from './hooks';

export function createElement<P extends {}>(
  type: FunctionComponent<P> | typeof Element,
  props?: P | null,
  children?: ReactNode
): Element | HookElement {
  let normalizedProps: any;
  if (Element.isElementConstructor(type)) {
    normalizedProps = {...props};
  } else {
    normalizedProps = {...(type as FunctionComponent<P>).defaultProps, ...props};
  }
  
  if (arguments.length > 2) {
    const normalizedChildren = arguments.length > 3 ? Array.prototype.slice.call(arguments, 2) : children;
    normalizedProps.children = normalizedChildren;
  }
  if ((type as any as typeof Element).$$isElement) {
    return new (type as typeof Element)(normalizedProps)
  } else {
    return new HookElement(type, normalizedProps)
  }
}

export function isValidElement(el: unknown): el is Element {
  return Element.isElementConstructor(el);
}