import { ReactNode } from './types';

export function Fragment(props: {children?: ReactNode}) {
	return props.children;
};

Fragment.displayName = 'Fragment';
Fragment.$$typeof ='react.fragment';