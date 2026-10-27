"use strict";

import "adaptive-extender/web";
import { type Mark } from "../models/mark.js";
import { type Token } from "../models/token.js";
import { type Folding } from "./folding.js";
import { Matcher } from "./matcher.js";
import { type WordIndex } from "./word-index.js";

//#region Query
export class Query {
	static #batch: number = 64;
	#matchers: Matcher[];
	#folding: Folding;
	#skipping: boolean;
	// The next word id the lead matcher aligns, and then the questions that may match
	#cursor: number = 0;
	#flags: Uint8Array | null = null;

	constructor(text: string, folding: Folding, skipping: boolean, tolerant: boolean) {
		this.#matchers = folding.words(text).map(word => new Matcher(word, tolerant));
		this.#folding = folding;
		this.#skipping = skipping;
	}

	get blank(): boolean {
		return this.#matchers.length === 0;
	}

	/** Aligns the longest query word with every word of the index until the deadline; true once the questions that may match are known. A question can match only if it holds a word this matcher finds. */
	narrow(index: WordIndex, deadline: number): boolean {
		if (this.#flags !== null) return true;
		const lead = this.#lead();
		const { words } = index;
		let cursor = this.#cursor;
		while (cursor < words.length) {
			if (cursor % Query.#batch === 0 && performance.now() >= deadline) break;
			lead.match(cursor, words[cursor]);
			cursor++;
		}
		this.#cursor = cursor;
		if (cursor < words.length) return false;
		this.#flags = Query.#mark(index, lead);
		return true;
	}

	admits(position: number): boolean {
		const flags = this.#flags;
		if (flags === null) throw new ReferenceError("The query is not narrowed yet");
		return flags[position] === 1;
	}

	#lead(): Matcher {
		const matchers = this.#matchers;
		let lead = matchers[0];
		for (const matcher of matchers) {
			if (matcher.length > lead.length) lead = matcher;
		}
		return lead;
	}

	// When the lead's words occur in more places than there are questions, marking them costs more than testing every question
	static #mark(index: WordIndex, lead: Matcher): Uint8Array {
		const { words, count } = index;
		const ids: number[] = [];
		let total = 0;
		for (let id = 0; id < words.length; id++) {
			if (lead.match(id, words[id]) === null) continue;
			ids.push(id);
			total += index.postings(id).length;
		}
		const flags = new Uint8Array(count);
		if (total > count) return flags.fill(1);
		for (const id of ids) {
			for (const position of index.postings(id)) {
				flags[position] = 1;
			}
		}
		return flags;
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
