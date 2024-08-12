// 定义fiberNode
import { Key, Props, Ref } from 'shared/ReactTypes';
import { WorkTag } from './workTags';
import { NoFlags, Flags } from './fiberFlags';

export class FiberNode {
	tag: WorkTag; // dom类型
	key: Key;
	stateNode: any; // 节点对应的实际DOM节点或者组件实例
	type: any; // 节点类型，可以是原生dom元素，函数组件或者类组件等
	return: FiberNode | null; // 父节点
	sibling: FiberNode | null; // 兄弟节点
	child: FiberNode | null; // 第一个字节点
	index: number; // 索引
	ref: Ref;
	pendingProps: Props; // 节点的新属性，用于在协调过程中更新
	memoizedProps: Props | null; // 已经更新完成的属性
	memoizedState: any; // 更新完成之后的state
	alternate: FiberNode | null; // 指向workInProgressFiber，正在更新的dom树
	flags: Flags; // 节点的副作用，更新，插入，删除等
	subtreeFlags: Flags; // 子节点的阻作用类型
	updateQueue: unknown; // 更新计划队列

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 类型
		this.tag = tag;
		this.key = key;
		this.ref = null;
		this.stateNode = null;
		this.type = null;

		// 构建树状结构
		this.return = null;
		this.sibling = null;
		this.child = null;
		this.index = 0;

		// 作为工作单元，更新相关
		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.memoizedState = null;

		this.alternate = null;
		this.flags = NoFlags;
		this.subtreeFlags = NoFlags;
		this.updateQueue = null;
	}
}
