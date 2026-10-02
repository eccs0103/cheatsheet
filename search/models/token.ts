"use strict";

import "adaptive-extender/web";

//#region Token
export class Token {
	static #threshold: number = 5;
	#start: number;
	#end: number;
	#text: string;

	constructor(start: number, end: number, text: string) {
		this.#start = start;
		this.#end = end;
		this.#text = text;
	}

	matches(word: string, tolerant: boolean): boolean {
		const text = this.#text;
		if (text.includes(word)) return true;
		if (!tolerant) return false;
		const { length } = word;
		if (length < Token.#threshold) return false;
		for (let size = length - 1; size <= length + 1; size++) {
			if (Token.#near(word, text.slice(0, size))) return true;
		}
		return false;
	}

	range(node: Text): StaticRange {
		return new StaticRange({ startContainer: node, startOffset: this.#start, endContainer: node, endOffset: this.#end });
	}

	static #near(source: string, target: string): boolean {
		const difference = source.length - target.length;
		if (Math.abs(difference) > 1) return false;
		let index = 0;
		while (index < source.length && index < target.length && source[index] === target[index]) index++;
		if (difference > 0) return source.slice(index + 1) === target.slice(index);
		if (difference < 0) return source.slice(index) === target.slice(index + 1);
		if (source.slice(index + 1) === target.slice(index + 1)) return true;
		return source[index] === target[index + 1] && source[index + 1] === target[index] && source.slice(index + 2) === target.slice(index + 2);
	}
}
//#endregion
