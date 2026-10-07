"use strict";

import "adaptive-extender/web";
import { type Mark } from "../models/mark.js";
import { type Token } from "../models/token.js";
import { type Folding } from "./folding.js";
import { Matcher } from "./matcher.js";

//#region Query
export class Query {
	#matchers: Matcher[];
	#folding: Folding;
	#skipping: boolean;

	constructor(text: string, folding: Folding, skipping: boolean, tolerant: boolean) {
		this.#matchers = folding.words(text).map(word => new Matcher(word, tolerant));
		this.#folding = folding;
		this.#skipping = skipping;
	}

	get blank(): boolean {
		return this.#matchers.length === 0;
	}

	test(tokens: readonly Token[]): Mark[] | null {
		const matchers = this.#matchers;
		if (matchers.length === 0) return [];
		if (this.#skipping) return this.#sequence(matchers, tokens);
		return this.#phrase(matchers, tokens);
	}

	#sequence(matchers: readonly Matcher[], tokens: readonly Token[]): Mark[] | null {
		const folding = this.#folding;
		const marks: Mark[] = [];
		let position = 0;
		for (const matcher of matchers) {
			let mark: Mark | null = null;
			while (mark === null && position < tokens.length) {
				mark = tokens[position].find(matcher, folding);
				position++;
			}
			if (mark === null) return null;
			marks.push(mark);
		}
		return marks;
	}

	#phrase(matchers: readonly Matcher[], tokens: readonly Token[]): Mark[] | null {
		const folding = this.#folding;
		for (let start = 0; start + matchers.length <= tokens.length; start++) {
			const marks: Mark[] = [];
			for (const [index, matcher] of matchers.entries()) {
				const mark = tokens[start + index].find(matcher, folding);
				if (mark === null) break;
				marks.push(mark);
			}
			if (marks.length === matchers.length) return marks;
		}
		return null;
	}
}
//#endregion
