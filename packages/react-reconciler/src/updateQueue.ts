import { Action } from 'shared/ReactTypes';
import { Update } from './fiberFlags';

// update对象
export interface Update<State> {
	action: Action<State>;
}

// updateQueue对象
export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}

// 创建update实例
export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

// 创建updateQueue实例
export const createUpdateQueue = <State>(): UpdateQueue<State> => {
	return {
		shared: {
			pending: null
		}
	};
};

// 将update添加到updateQueue
export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
};

// 从updateQueue 消费 update
// 也就是根据初始状态和update，生成最终的statte
export const processUpdateQueue = <State>(
	baseState: State, // 初始state
	pendingUpdate: Update<State> | null // 待更新的状态
): { memoizedState: State } => {
	// 定义返回结果
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};
	// update 中action，可能是一个state值，也可能是一个更新state的方法
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// 若 action 是回调函数：(baseState = 1, update = (i) => 5i)) => memoizedState = 5
			result.memoizedState = action(baseState);
		} else {
			// 若 action 是状态值：(baseState = 1, update = 2) => memoizedState = 2
			result.memoizedState = action;
		}
	}
	return result;
};
