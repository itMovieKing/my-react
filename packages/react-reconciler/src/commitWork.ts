import { appendChildToContainer, Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags, Placement } from './fiberFlags';
import { HostComponent, HostRoot, HostText } from './workTags';

let nextEffct: FiberNode | null = null;

export const commitMutationEffcts = (finishedWork: FiberNode) => {
	nextEffct = finishedWork;

	while (nextEffct !== null) {
		// 向下遍历
		const child: FiberNode | null = nextEffct.child;

		if ((nextEffct.subtreeFlags & MutationMask) !== NoFlags && child !== null) {
			nextEffct = child;
		} else {
			// 向上遍历 DFS
			up: while (nextEffct !== null) {
				commitMutationEffectsOnFiber(nextEffct);
				const sibling: FiberNode | null = nextEffct.sibling;

				if (sibling !== null) {
					nextEffct = sibling;
					break up;
				}
				nextEffct = nextEffct.return;
			}
		}
	}
};

const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;

	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement;
	}

	// flags Update
	// flags ChildDeletion
};

const commitPlacement = (finishedWork: FiberNode) => {
	// finishedWork ~~DOM
	if (__DEV__) {
		console.info('执行placement操作', finishedWork);

		// parent DOM
		const hostParent = getHostParent(finishedWork);
		// finishedWork ~~DOM append to parent
		appendPlacementNodeIntoContainer(finishedWork, hostParent);
	}
};

function getHostParent(fiber: FiberNode): Container {
	let parent = fiber.return;

	while (parent) {
		const parentTag = parent.tag;
		// hostComponent hostRoot
		if (parentTag === HostComponent) {
			return parent.stateNode as Container;
		}
		if (parentTag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}
		parent = parent.return;
	}

	if (__DEV__) {
		console.warn('未找到host parent');
	}
}

function appendPlacementNodeIntoContainer(
	finishedWork: FiberNode,
	hostParent: Container
) {
	// fiber host
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(finishedWork.stateNode, hostParent);
		return;
	}

	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent);
		let sibling = child.sibling;

		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
}
