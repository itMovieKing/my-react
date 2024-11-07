import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import { HostComponent, HostRoot, HostText } from './workTags';
import { mountChildFibers, reconcileChildFibers } from './childFibers';

// 递
export const beginWork = (wip: FiberNode) => {
	switch (wip.tag) {
		case HostRoot: // 根节点
			return updateHostRoot(wip);
		case HostComponent: // 原生dom元素节点
			return updateHostComponent(wip);
		case HostText: // 文本节点，<p>234</p> 中的234，不存在子节点，所以不用处理
			return null;
		default:
			if (__DEV__) {
				console.warn('beginwork 暂未实现的组件类型');
			}
	}
	return null;
};

// 1. 处理更新状态，2.返回子fibernode
function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pendingUpdate = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	const { memoizedState } = processUpdateQueue(baseState, pendingUpdate);
	wip.memoizedState = memoizedState;

	// 对于hostroot来说这里wip.memoizedState就是render传进来的<App />
	const nextChildren = wip.memoizedState;
	// 生成子FiberNode的方法
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

// 例如<div><span/></div> 这里的div，那么他的子就是span
function updateHostComponent(wip: FiberNode) {
	// 因为span经过jsx处理之后会被方法props.children中
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

// 通过比较子节点的current 和子节点的 reactelement生成 子fibernode
// wip.alternate就是current
// mounted的时候，只给hostRootFiber加过wip
function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	const current = wip.alternate; // 父节点的current
	if (current !== null) {
		// update,有wip
		wip.child = reconcileChildFibers(wip, current?.child, children); // current.child -> 子节点的current，子节点的element
	} else {
		// mounted
		wip.child = mountChildFibers(wip, null, children);
	}
}
