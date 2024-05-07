import Group from '../shapes/Group';
import { ReactNode, FunctionComponent } from './types';
import { HookElement } from './hooks';
export function createPortal(children: ReactNode, container: Group, key?: null | string) {
    const props: PortalProps =  {container, children, key};
    return new HookElement(Portal, props);
}

export interface PortalProps {
    container: Group;
    children: ReactNode;
    key: null | string
}

export const Portal: FunctionComponent & {$$typeof: string} = () => {
    return null;
}

Portal.displayName = 'Portal';
Portal.$$typeof = 'react.portal';