"use strict";

import "adaptive-extender/web";
import { Segment } from "../models/segment.js";

//#region Query
export class Query {
	#pattern: RegExp | null;

	constructor(text: string, sensitive: boolean, skipping: boolean) {
		const words = text.split(/\s+/).filter(word => word.length > 0);
		if (words.length === 0) {
			this.#pattern = null;
			return;
		}

		let separator = "\\s+";
		if (skipping) separator = "\\s+(?:\\S+\\s+)*?";
		let flags = "g";
		if (!sensitive) flags += "i";
		this.#pattern = new RegExp(words.map(RegExp.escape).join(separator), flags);
	}

	matches(text: string): boolean {
		const pattern = this.#pattern;
		if (pattern === null) return true;
		return text.search(pattern) >= 0;
	}

	split(text: string): Segment[] {
		const pattern = this.#pattern;
		if (pattern === null) return [new Segment(text, false)];
		const segments: Segment[] = [];
		let index = 0;
		for (const match of text.matchAll(pattern)) {
			if (match.index > index) segments.push(new Segment(text.slice(index, match.index), false));
			segments.push(new Segment(match[0], true));
			index = match.index + match[0].length;
		}
		if (index < text.length) segments.push(new Segment(text.slice(index), false));
		return segments;
	}
}
//#endregion
