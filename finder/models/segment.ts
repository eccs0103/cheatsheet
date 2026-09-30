"use strict";

import "adaptive-extender/web";
import { createElement, type ReactNode } from "react";

//#region Segment
export class Segment {
	#text: string;
	#marked: boolean;

	constructor(text: string, marked: boolean) {
		this.#text = text;
		this.#marked = marked;
	}

	toElement(key: number): ReactNode {
		const text = this.#text;
		if (!this.#marked) return text;
		return createElement("mark", { key }, text);
	}
}
//#endregion
