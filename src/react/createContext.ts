import { Context, PropsWithChildren, ReactElement, Provider, Consumer } from './types';
import { useContext } from './hooks';

export function createContext<T>(defaultValue: T): Context<T> {
  const context: Context<T> & { defaultValue: T } = {
    defaultValue,
    Provider: function (props) {
      return props.children as ReactElement;
    },
    Consumer: function (props) {
      const value = useContext(context);
      return props.children(value) as ReactElement;
    },
  };
  (context.Provider as any).displayName = 'Context.Provider';
  (context.Provider as any).$$typeof = 'react.context';
  (context.Consumer as any).displayName = 'Context.Consumer';
  return context;
}