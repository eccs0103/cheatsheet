"use strict";

import "adaptive-extender/web";
import { Matching } from "../../settings/models/settings.js";
import { type Token } from "../models/token.js";
import { type Folding } from "./folding.js";

//#region Query
export class Query {
	#words: string[];
	#matching: Matching;
	#tolerant: boolean;

	constructor(text: string, folding: Folding, matching: Matching, tolerant: boolean) {
		this.#words = folding.words(text);
		this.#matching = matching;
		this.#tolerant = tolerant;
	}

	// ponytail: linear scan over every token per keystroke; add an inverted index if sheets reach ~10k questions
	test(tokens: readonly Token[]): Token[] | null {
		const words = this.#words;
		if (words.length === 0) return [];
		const matching = this.#matching;
		switch (matching) {
		case Matching.any: return this.#any(words, tokens);
		case Matching.order: return this.#order(words, tokens);
		case Matching.phrase: return this.#phrase(words, tokens);
		default: throw new TypeError(`Invalid '${matching}' matching`);
		}
	}

	#any(words: readonly string[], tokens: readonly Token[]): Token[] | null {
		const tolerant = this.#tolerant;
		const result: Set<Token> = new Set();
		for (const word of words) {
			const found = tokens.filter(token => token.matches(word, tolerant));
			if (found.length === 0) return null;
			for (const token of found) result.add(token);
		}
		return Array.from(result);
	}

	#order(words: readonly string[], tokens: readonly Token[]): Token[] | null {
		const tolerant = this.#tolerant;
		const result: Token[] = [];
		let position = 0;
		for (const word of words) {
			const index = tokens.findIndex((token, place) => place >= position && token.matches(word, tolerant));
			if (index < 0) return null;
			result.push(tokens[index]);
			position = index + 1;
		}
		return result;
	}

	#phrase(words: readonly string[], tokens: readonly Token[]): Token[] | null {
		const tolerant = this.#tolerant;
		for (let start = 0; start + words.length <= tokens.length; start++) {
			if (words.every((word, offset) => tokens[start + offset].matches(word, tolerant))) return tokens.slice(start, start + words.length);
		}
		return null;
	}
}
//#endregion
