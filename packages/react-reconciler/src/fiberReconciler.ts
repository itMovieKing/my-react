import { Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';
import {
	creareUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue
} from './updateQueue';
import { ReactElementType } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

// 其实这里是创建了一个fiberRootNode
export function createContainer(container: Container) {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);
	// 初始化的时候创建一个update queue为后续的更新创造条件
	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
}

// root.render() 内部调用
export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current;
	// render触发的这个方法，这里入参是render的入参
	const update = creareUpdate<ReactElementType | null>(element);
	// 加入更新队列
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	);
	// 跟workloop穿起来
	scheduleUpdateOnFiber(hostRootFiber);
	// TODO: 不理解这里为什么是return element
	return element;
}
