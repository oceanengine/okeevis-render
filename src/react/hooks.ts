import Group from '../shapes/Group';
import Element from '../shapes/Element';
import { Portal, PortalProps } from './createPortal';
import { Fragment } from './Fragment';
import * as Children from './Children';
import { shallowEqual } from './shallow-euqal';
import {
  FunctionComponent,
  DependencyList,
  Context,
  MutableRefObject,
  MemoComponent,
} from './types';

/**
 * usestate memoiedstate is the current state
 * useRef  {current: any}
 * useCallback [result, depend]
 * useEffect(clear, depend)
 * useMemo (memovalue, depend)
 */
interface Hook {
  _component: HookElement;
  baseState: any;
  memoizedState: any;
  next?: Hook;
  type?: HookType;
}
const enum HookType {
  EFFECT,
  STATE,
}

let currentComponent: HookElement;
let currentHook: Hook;
let prevHook: Hook;

export class HookElement<T = {}> extends Group {
  public type = 'function-component';
  public key: string | number;
  public $$type: FunctionComponent;
  public props: T;

  public _hooks: Hook;

  private _willUpdate: boolean = false;

  private _portalFragment: HookElement;

  public constructor(type: any, props: T & { key?: string | number }) {
    super();
    this.key = this.attr.key = props.key;
    this.props = props;
    this.$$type = type;
  }

  public mounted() {
    super.mounted();
    if (this.ownerRender) {
      if (this.$$type === (Portal as any)) {
        this._mountPortal();
      } else {
        this.renderWithHooks();
      }
    }
  }

  public destroy() {
    super.destroy();
    let hook = this._hooks;
    while (hook) {
      if (hook.type === HookType.EFFECT) {
        if (typeof hook.memoizedState === 'function') {
          hook.memoizedState();
        }
      }
      hook = hook.next;
    }
    this._hooks = null;

    if ((this.$$type as MemoComponent<unknown>).$$typeof === 'react.portal') {
      this._portalFragment.parentNode?.remove(this._portalFragment);
      this._portalFragment = null;
    }
  }

  public updateState() {
    if (!this._willUpdate) {
      this._willUpdate = true;
      Promise.resolve().then(() => {
        this.renderWithHooks(true);
        this._willUpdate = false;
      });
    }
  }

  public updateProps(nextProps: T) {
    if ((this.$$type as unknown as MemoComponent<T>).$$typeof === 'react.memo') {
      const compare = (this.$$type as MemoComponent<any>).compare || shallowEqual;
      const propsChanged = !compare(this.props, nextProps);
      if (!propsChanged) {
        return;
      }
    }
    this.props = nextProps;
    if (this.$$type === Portal) {
      this._portalFragment.updateProps(nextProps);
    } else {
      this.renderWithHooks(true);
    }
  }

  private _mountPortal() {
    const { container, children, key } = this.props as unknown as PortalProps;
    const fragment = new HookElement(Fragment, {
      key,
      children,
    });
    this._portalFragment = fragment;
    container.add(fragment);
  }

  private renderWithHooks(again = false) {
    currentComponent = this;
    currentHook = this._hooks;
    prevHook = undefined;
    const vnode = this.$$type(this.props);
    const nodeList = Array.isArray(vnode) ? vnode : [vnode];
    const validNodeList = nodeList.filter(node => node);
    if (!again) {
      validNodeList.forEach(node => {
        if ((node as HookElement<unknown>).$$type) {
          node.mounted();
        }
      });
    }
    // 需要过滤nodeList中的非element对象，数组打平
    const processedList: Element[] = getProcessList(nodeList);
    this.updateAll(processedList);
    currentComponent = currentHook = prevHook = undefined;
  }
}

function getProcessList(nodes: any[]): Element[] {
  const out: Element[] = [];
  Children.forEach(nodes, node => {
    if (node && Element.isElementConstructor(node)) {
      out.push(node);
    }
  });
  return out;
}

function getCurrentHook(): Hook {

  if (!currentComponent) {
    throw new Error('hook must be used in a component');
  }
  
  let hook: Hook;
  if (currentHook) {
    hook = currentHook;
  } else {
    hook = {
      _component: null,
      memoizedState: null,
      baseState: null,
      next: null,
    };
    if (!currentComponent._hooks) {
      currentComponent._hooks = hook;
    }
  }
  if (prevHook) {
    prevHook.next = hook;
  }

  prevHook = hook;
  currentHook = hook.next;

  return hook;
}

function argsChanged(oldArgs: any[], newArgs: any[]) {
  return (
    !oldArgs ||
    oldArgs.length !== newArgs.length ||
    newArgs.some((arg, index) => arg !== oldArgs[index])
  );
}

type Dispatch<A> = (value: A) => void;
type SetStateAction<S> = S | ((prevState: S) => S);

export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  const hook = getCurrentHook();
  if (!hook._component) {
    hook._component = currentComponent;
    hook.baseState = typeof initialState === 'function' ? (initialState as () => S)() : initialState;
  }
  const setState: Dispatch<SetStateAction<S>> = (value: SetStateAction<S>) => {
    if (value === hook.baseState) {
      return;
    }
    hook.memoizedState = value;
    hook.baseState = value;
    hook._component.updateState();
  };
  return [hook.baseState, setState];
}

type EffectCallback = () => void | (() => void | undefined);

export function useEffect(effect: EffectCallback, deps?: DependencyList): void {
  const hook = getCurrentHook();
  hook.type = HookType.EFFECT;
  if (!hook._component) {
    hook._component = currentComponent;
    hook.baseState = [effect, deps];
    pushPendingEffect(hook);
  } else {
    const changed = argsChanged(hook.baseState[1], deps as any);
    if (changed) {
      const clearFn = hook.memoizedState;
      if (typeof clearFn === 'function') {
        clearFn();
      }
      hook.baseState = [effect, deps];
      pushPendingEffect(hook);
    }
  }
}

export function useRef<T>(inititalValue: T | null): MutableRefObject<T> {
  const hook = getCurrentHook();
  if (!hook._component) {
    hook._component = currentComponent;
    hook.baseState = { current: inititalValue };
  }
  return hook.baseState;
}

export function useCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList,
): T {
  const hook = getCurrentHook();
  if (!hook._component) {
    hook._component = currentComponent;
    hook.baseState = [callback, deps];
    hook.memoizedState = callback;
  } else {
    const changed = argsChanged(hook.baseState[1], deps as any);
    if (changed) {
      hook.baseState = [callback, deps];
      hook.memoizedState = callback;
    }
  }
  return hook.memoizedState;
}

export function useMemo<T>(factory: () => T, deps: DependencyList | undefined): T {
  const hook = getCurrentHook();
  if (!hook._component) {
    hook._component = currentComponent;
    hook.baseState = [factory, deps];
    hook.memoizedState = factory.apply(null, deps);
  } else {
    const changed = argsChanged(hook.baseState[1], deps as any);
    if (changed) {
      hook.baseState = [factory, deps];
      hook.memoizedState = factory.apply(null, deps);
    }
  }
  return hook.memoizedState;
}

export function useContext<T>(context: Context<T>): T {
  const Provider = context.Provider;
  let node = currentComponent.parentNode;
  while (node) {
    if (Element.isHookElement(node) && node.$$type === Provider) {
      return (node.props as any).value;
    }
    node = node.parentNode;
  }
  return (context as any).defaultValue;
}

type ReducerWithoutAction<S> = (prevState: S) => S;
type DispatchWithoutAction = () => void;
type ReducerStateWithoutAction<R extends ReducerWithoutAction<any>> =
  R extends ReducerWithoutAction<infer S> ? S : never;
type Reducer<S, A> = (prevState: S, action: A) => S;
type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;

export function useReducer<R extends ReducerWithoutAction<any>, I>(
  reducer: R,
  initializerArg: I,
  initializer: (arg: I) => ReducerStateWithoutAction<R>,
): [ReducerStateWithoutAction<R>, DispatchWithoutAction];

export function useReducer<R extends ReducerWithoutAction<any>>(
  reducer: R,
  initializerArg: ReducerStateWithoutAction<R>,
  initializer?: undefined,
): [ReducerStateWithoutAction<R>, DispatchWithoutAction];

export function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I & ReducerState<R>,
  initializer: (arg: I & ReducerState<R>) => ReducerState<R>,
): [ReducerState<R>, Dispatch<ReducerAction<R>>];

export function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I,
  initializer: (arg: I) => ReducerState<R>,
): [ReducerState<R>, Dispatch<ReducerAction<R>>];

export function useReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
  initializer?: undefined,
): [ReducerState<R>, Dispatch<ReducerAction<R>>];

export function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I & ReducerState<R>,
  initializer: (arg: I & ReducerState<R>) => ReducerState<R>,
): [ReducerState<R>, Dispatch<ReducerAction<R>>] {
  const hook = getCurrentHook();
  if (!hook._component) {
    hook._component = currentComponent;
    hook.baseState = initializer ? initializer(initializerArg) : initializerArg;
    hook.memoizedState = [reducer, initializerArg, initializer];
  }

  const dispatch: Dispatch<ReducerAction<R>> = (action: R) => {
    hook.baseState = reducer.call(null, hook.baseState, action);
    hook._component.updateState();
  };

  return [hook.baseState, dispatch];
}

function pushPendingEffect(hook: Hook) {
  hook._component.ownerRender.__pushPendingEffect(() => {
    hook.memoizedState = hook.baseState[0]();
  });
}
