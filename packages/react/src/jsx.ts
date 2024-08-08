import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbol';
import {
	Type,
	Ref,
	Key,
	Props,
	ReactElementType,
	ElementType
} from 'shared/ReactTypes';

const ReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElementType {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE, //内部使用字段，ReactElement标识
		type,
		key,
		ref,
		props,
		__mark: 'yk' // 自定义字段，跟react包区分开，实际上react源码中没有
	};
	return element;
};

export const jsx = (type: ElementType, config: any, ...maybechildren: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;

	// 单独处理key，ref和props
	for (const prop in config) {
		const val = config[prop];
		if (prop === 'key') {
			if (val !== undefined) {
				// 转换为string
				key = '' + val;
			}
			continue;
		}
		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	// ---------------------------------- 这里不太明白，children应该是在config里的 start ----------------------------------
	// 源码中第三个参数其实是maybekey，把key单拆出来了，但这里不重要，为了不节外生枝暂时跟着大佬走
	const childrenLength = maybechildren.length;
	if (childrenLength) {
		if (childrenLength === 1) {
			props.children = maybechildren[0];
		} else {
			props.children = maybechildren;
		}
	}
	// ---------------------------------- 这里不太明白，children应该是在config里的 end ----------------------------------

	return ReactElement(type, key, ref, props);
};

// 实际上在react中jsxDEV会多一些额外的检查
export const jsxDEV = jsx;
