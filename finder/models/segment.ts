"use strict";

import "adaptive-extender/web";

//#region Segment
export class Segment {
	#text: string;
	#marked: boolean;

	constructor(text: string, marked: boolean) {
		this.#text = text;
		this.#marked = marked;
	}

	toNode(): Node {
		const text = this.#text;
		if (!this.#marked) return document.createTextNode(text);
		const markSegment = document.createElement("mark");
		markSegment.textContent = text;
		return markSegment;
	}
}
//#endregion
