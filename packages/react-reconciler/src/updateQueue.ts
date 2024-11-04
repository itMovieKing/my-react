import { Action } from 'shared/ReactTypes';
import { Update } from './fiberFlags';

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}

export const creareUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

export const createUpdateQueue = <State>(): UpdateQueue<State> => {
	return {
		shared: {
			pending: null
		}
	};
};

// 插入更新队列
export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
};

// updatequeue消费update方法，其实就是根据update更新state
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State>
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};
	// 更新有两种可能性
	// 1. baseState 1, update 2 => memoizedState 2
	// 2. baseState 2, update x => 2x   => memoizedState 4
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			result.memoizedState = action(baseState);
		} else {
			result.memoizedState = action;
		}
	}
	return result;
};
