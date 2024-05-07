import { default as GraphicElement } from '../shapes/Element';

type PropsWithChildren<P> = P & { children?: ReactNode };
type ReactText = string | number;
type ReactChild = GraphicElement | ReactElement | ReactText;
type JSXElementConstructor<P> = (props: P) => ReactElement | null;
interface ReactNodeArray extends Array<ReactNode> {}
type ReactFragment = {} | ReactNodeArray;
type ReactNode = ReactChild | ReactFragment | boolean | null | undefined;
type Key = string | number;

interface RefObject<T> {
  readonly current: T | null;
}
interface MutableRefObject<T> {
  current: T;
}
interface NamedExoticComponent<P = {}> extends ExoticComponent<P> {
  displayName?: string;
}

interface MemoComponent<P> extends NamedExoticComponent {
  compare?: (prevProps: Readonly<PropsWithChildren<P>>, nextProps: Readonly<PropsWithChildren<P>>) => boolean;
  $$typeof?: 'react.element' | 'react.memo' | 'react.fragment' | 'react.portal';
}

interface ReactElement<
  P = any,
  T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>,
> {
  type: T;
  props: P;
  key: Key | null;
}

interface FunctionComponent<P = {}> {
  (props: PropsWithChildren<P>): ReactElement<any, any> | null;
  defaultProps?: Partial<P>;
  displayName?: string;
}

interface FunctionComponentElement<P> extends ReactElement<P, FunctionComponent<P>> {
  ref?: 'ref' extends keyof P ? (P extends { ref?: infer R } ? R : never) : never;
}

interface ProviderProps<T> {
  value: T;
  children?: ReactNode;
}

interface NamedExoticComponent<P = {}> extends ExoticComponent<P> {
  displayName?: string;
}

interface ExoticComponent<P = {}> {
  /**
   * **NOTE**: Exotic components are not callable.
   */
  (props: P): ReactElement | null;
  // readonly $$typeof: symbol;
}

interface ConsumerProps<T> {
  children?: (value: T) => ReactNode;
}

type Provider<T> = ExoticComponent<ProviderProps<T>>;
type Consumer<T> = ExoticComponent<ConsumerProps<T>>;
interface Context<T> {
  Provider: Provider<T>;
  Consumer: Consumer<T>;
  displayName?: string;
}

type DependencyList = ReadonlyArray<any>;

export {
  PropsWithChildren,
  ReactChild,
  ReactElement,
  ReactNode,
  FunctionComponent,
  FunctionComponentElement,
  Context,
  RefObject,
  MutableRefObject,
  Provider,
  Consumer,
  DependencyList,
  NamedExoticComponent,
  MemoComponent,
};
