import { HookElement } from "./hooks";
import { ReactNode } from "./types";

export function cloneElement(vnode: HookElement, props: any, children: ReactNode) {
	let normalizedProps: any= {...vnode.props},
		key,
		ref,
		i;

	let defaultProps: any;

	if (vnode.$$type && vnode.$$type.defaultProps) {
		defaultProps = vnode.$$type.defaultProps;
	}

	for (i in props) {
		if (i == 'key') key = props[i];
		else if (i == 'ref') ref = props[i];
		else if (props[i] === undefined && defaultProps !== undefined) {
			normalizedProps[i] = defaultProps[i];
		} else {
			normalizedProps[i] = props[i];
		}
	}

	if (arguments.length > 2) {
		normalizedProps.children =
			arguments.length > 3 ? Array.prototype.slice.call(arguments, 2) : children;
	}
    return new HookElement(vnode.$$type, {
        ...normalizedProps,
        key: key || vnode.key,
        ref,
    })
}