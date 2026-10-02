"use strict";

import "adaptive-extender/web";

//#region Mark
export class Mark {
	#start: number;
	#end: number;

	constructor(start: number, end: number) {
		this.#start = start;
		this.#end = end;
	}

	shift(offset: number): Mark {
		return new Mark(this.#start + offset, this.#end + offset);
	}

	project(starts: readonly number[], ends: readonly number[]): Mark {
		return new Mark(starts[this.#start], ends[this.#end - 1]);
	}

	range(node: Text): StaticRange {
		return new StaticRange({ startContainer: node, startOffset: this.#start, endContainer: node, endOffset: this.#end });
	}
}
//#endregion
