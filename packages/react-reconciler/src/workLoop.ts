import { FiberNode } from './fiber';

// 正在更新的fiber
let workInProgress: FiberNode | null = null;

// 深度遍历dom树
function renderRoot(root: FiberNode) {
	// 初始化
	prepareFreshStack(root);
	do {
		try {
			workLoop(root);
			break;
		} catch (e) {
			console.warn('workLoop发生错误', e);
		}
	} while (true);
}

// 初始化 变量
function prepareFreshStack(root: FiberNode) {
	workInProgress = root;
}

// 深度优先遍历，向下递归子节点，当前更新的fiber不为空就一直执行
function workLoop(root: FiberNode) {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

// 最小工作单元
function performUnitOfWork(fiber: FiberNode) {
	// 比较并返回返回子fibdernode
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps; // 更新完成之后，更新当前属性

	if (next !== null) {
		// 没有子节点就返回向上遍历兄弟节点或者父节点
		completeUnitOfWork(fiber);
	} else {
		// 否则就继续向下遍历子节点
		workInProgress = next;
	}
}

//
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
