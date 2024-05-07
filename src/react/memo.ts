import { FunctionComponent, PropsWithChildren, NamedExoticComponent, MemoComponent } from './types';

export function memo<P extends object>(
    Component: FunctionComponent<P>,
    propsAreEqual?: (prevProps: Readonly<PropsWithChildren<P>>, nextProps: Readonly<PropsWithChildren<P>>) => boolean
): NamedExoticComponent<P> {
    const component = Component as any as MemoComponent<P>;
    component.$$typeof = 'react.memo';
    component.compare = propsAreEqual;
    return component;
}
