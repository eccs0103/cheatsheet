"use strict";

import "adaptive-extender/web";
import { Token } from "../models/token.js";

//#region Folding
export class Folding {
	static #word: RegExp = /[\p{L}\p{M}\p{N}]+/gu;
	static #marks: RegExp = /\p{M}/gu;
	#sensitive: boolean;
	#accents: boolean;

	constructor(sensitive: boolean, accents: boolean) {
		this.#sensitive = sensitive;
		this.#accents = accents;
	}

	#fold(text: string): string {
		let result = text;
		if (!this.#accents) result = result.normalize("NFD").replace(Folding.#marks, String.empty);
		if (!this.#sensitive) result = result.toLowerCase();
		return result;
	}

	words(text: string): string[] {
		return Array.from(text.matchAll(Folding.#word), match => this.#fold(match[0]));
	}

	tokenize(text: string): Token[] {
		return Array.from(text.matchAll(Folding.#word), match => new Token(match.index, match.index + match[0].length, this.#fold(match[0])));
	}
}
//#endregion
