"use strict";

import "adaptive-extender/web";
import { type Mark } from "./mark.js";
import { type Matcher } from "../services/matcher.js";
import { type Folding } from "../services/folding.js";

//#region Token
export class Token {
	#offset: number;
	#word: string;
	#text: string;
	#id: number;

	constructor(offset: number, word: string, text: string, id: number) {
		this.#offset = offset;
		this.#word = word;
		this.#text = text;
		this.#id = id;
	}

	/** The folded word's id in its word index. */
	get id(): number { return this.#id; }

	find(matcher: Matcher, folding: Folding): Mark | null {
		const local = matcher.match(this.#id, this.#text);
		if (local === null) return null;
		return folding.locate(this.#word, this.#offset, local);
	}
}
//#endregion
