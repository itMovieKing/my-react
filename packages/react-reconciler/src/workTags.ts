// 标识不同类型的工作单元
export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText;

export const FunctionComponent = 0;
export const HostRoot = 3;
export const HostComponent = 5; //<div>hello</div>  --> div
export const HostText = 6; //<div>hello</div>  --> hello
