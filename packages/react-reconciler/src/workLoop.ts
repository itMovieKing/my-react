import { beginWork } from './beginWork';
import { commitMutationEffcts } from './commitWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

// 正在更新的fiber
let workInProgress: FiberNode | null = null;

// 初始化 变量
function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

// TODO: 调度功能
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// 更新是从根节点开始的
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

// 从当前节点查找到根节点
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	while (node.return !== null) {
		node = node.return;
	}

	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

// 深度遍历dom树
function renderRoot(root: FiberRootNode) {
	// 初始化
	prepareFreshStack(root);
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.warn('workLoop发生错误', e);
			}
			workInProgress = null;
		}
	} while (true);

	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;

	// wip fibernode树
	commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;
	if (finishedWork === null) {
		return;
	}

	if (__DEV__) {
		console.info('commit阶段开始', root);
	}

	root.finishedWork = null;

	// 判断 是否存在三个阶段需要执行的操作
	const subtreeHasEffct =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	const rootHasEffct = (finishedWork.flags & MutationMask) !== NoFlags;

	if (subtreeHasEffct || rootHasEffct) {
		// beforeMutation
		// mutabtion
		commitMutationEffcts(finishedWork);
		// 更新完成之后 将wip复制给current
		root.current = finishedWork;
		// layout
	} else {
		// 更新完成之后 将wip复制给current
		root.current = finishedWork;
	}
}

// 深度优先遍历，向下递归子节点，当前更新的fiber不为空就一直执行
// HostFiberRoot，没有wip，所以这里相当于是遍历到根节点
function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

// 最小工作单元
function performUnitOfWork(fiber: FiberNode) {
	// 比较并返回子fibdernode
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps; // 更新完成之后，更新当前属性

	if (next === null) {
		// 没有子节点就返回向上遍历兄弟节点或者父节点，叶子节点，开始归
		completeUnitOfWork(fiber);
	} else {
		// 否则就继续向下遍历子节点
		workInProgress = next;
	}
}

// 遍历兄弟节点
function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;
	do {
		// 生成更新计划
		completeWork(node);
		const sibling = node.sibling;
		// 有兄弟节点遍历兄弟节点
		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		// 否则回到父节点
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
