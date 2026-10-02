"use strict";

import "adaptive-extender/web";
import { type Mark } from "../models/mark.js";
import { Token } from "../models/token.js";

//#region Folding
export class Folding {
	static #word: RegExp = /[\p{L}\p{M}\p{N}]+/gu;
	static #marks: RegExp = /\p{M}/gu;
	static #ascii: RegExp = /^[\x00-\x7F]*$/;
	static #letters: Map<string, string> = new Map([["ł", "l"], ["Ł", "L"], ["ø", "o"], ["Ø", "O"], ["đ", "d"], ["Đ", "D"], ["ð", "d"], ["Ð", "D"], ["ħ", "h"], ["Ħ", "H"], ["ı", "i"], ["ß", "ss"], ["ẞ", "SS"], ["æ", "ae"], ["Æ", "AE"], ["œ", "oe"], ["Œ", "OE"], ["þ", "th"], ["Þ", "TH"]]);
	#sensitive: boolean;
	#accents: boolean;

	constructor(sensitive: boolean, accents: boolean) {
		this.#sensitive = sensitive;
		this.#accents = accents;
	}

	#letter(char: string): string {
		let result = char;
		if (!this.#accents) result = Folding.#plain(result);
		if (!this.#sensitive) result = result.toLowerCase();
		return result;
	}

	// NFD strips combining marks; letters with no decomposition (ł, ø, ß…) come from the table
	static #plain(char: string): string {
		const letter = Folding.#letters.get(char);
		if (letter !== undefined) return letter;
		return char.normalize("NFD").replace(Folding.#marks, String.empty);
	}

	// Folded per character, so every folded unit maps back to the character it came from
	#fold(word: string): string {
		if (!Folding.#ascii.test(word)) return Array.from(word, char => this.#letter(char)).join(String.empty);
		if (this.#sensitive) return word;
		return word.toLowerCase();
	}

	words(text: string): string[] {
		return Array.from(text.matchAll(Folding.#word), match => this.#fold(match[0]));
	}

	tokenize(text: string): Token[] {
		return Array.from(text.matchAll(Folding.#word), match => new Token(match.index, match[0], this.#fold(match[0])));
	}

	locate(word: string, offset: number, local: Mark): Mark {
		if (Folding.#ascii.test(word)) return local.shift(offset);
		const starts: number[] = [];
		const ends: number[] = [];
		let position = offset;
		for (const char of word) {
			const end = position + char.length;
			for (let unit = this.#letter(char).length; unit > 0; unit--) {
				starts.push(position);
				ends.push(end);
			}
			position = end;
		}
		return local.project(starts, ends);
	}
}
//#endregion
