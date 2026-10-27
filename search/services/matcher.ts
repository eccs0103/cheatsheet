"use strict";

import "adaptive-extender/web";
import { Mark } from "../models/mark.js";

//#region Row
class Row {
	distances: Int32Array = new Int32Array(0);
	origins: Int32Array = new Int32Array(0);

	reserve(width: number): void {
		if (this.distances.length >= width) return;
		this.distances = new Int32Array(width * 2);
		this.origins = new Int32Array(width * 2);
	}

	open(width: number): void {
		const { distances, origins } = this;
		for (let index = 0; index < width; index++) {
			distances[index] = 0;
			origins[index] = index;
		}
	}

	best(width: number): Mark {
		const { distances, origins } = this;
		let end = 1;
		for (let index = 2; index < width; index++) {
			if (distances[index] < distances[end] || (distances[index] === distances[end] && origins[index] <= origins[end])) end = index;
		}
		return new Mark(origins[end], end);
	}
}
//#endregion
//#region Matcher
export class Matcher {
	static #ratio: number = 4;
	#word: string;
	#budget: number = 0;
	// Results by word id: which words are aligned already, and the marks of those that match
	#known: Uint8Array = new Uint8Array(0);
	#hits: Map<number, Mark> = new Map();
	#rows: Row[] = [new Row(), new Row(), new Row()];

	constructor(word: string, tolerant: boolean) {
		this.#word = word;
		if (tolerant) this.#budget = Math.trunc((word.length - 1) / Matcher.#ratio);
	}

	get length(): number { return this.#word.length; }

	/** Aligns the word with the folded text of word `id`, once per id. */
	match(id: number, text: string): Mark | null {
		const known = this.#known;
		if (id < known.length && known[id] === 1) return this.#hits.get(id) ?? null;
		const result = this.#align(text);
		this.#remember(id, result);
		return result;
	}

	#remember(id: number, result: Mark | null): void {
		const previous = this.#known;
		let known = previous;
		if (id >= previous.length) {
			known = new Uint8Array(Math.max(id + 1, previous.length * 2));
			known.set(previous);
			this.#known = known;
		}
		known[id] = 1;
		if (result !== null) this.#hits.set(id, result);
	}

	#align(text: string): Mark | null {
		const word = this.#word;
		const index = text.indexOf(word);
		if (index >= 0) return new Mark(index, index + word.length);
		const budget = this.#budget;
		if (budget === 0) return null;
		if (text.length < word.length - budget) return null;
		return this.#approximate(word, text, budget);
	}

	// Sellers' approximate substring search with Damerau adjacent transpositions; each cell also carries where its alignment starts
	#approximate(word: string, text: string, budget: number): Mark | null {
		const width = text.length + 1;
		const rows = this.#rows;
		for (const row of rows) {
			row.reserve(width);
		}
		let [older, previous, current] = rows;
		previous.open(width);
		for (let row = 1; row <= word.length; row++) {
			const letter = word[row - 1];
			const prior = word[row - 2];
			const { distances, origins } = current;
			const { distances: distances2, origins: origins2 } = previous;
			const { distances: distances3, origins: origins3 } = older;
			distances[0] = row;
			origins[0] = 0;
			let minimum = row;
			for (let column = 1; column < width; column++) {
				const char = text[column - 1];
				let distance = distances2[column - 1] + Number(letter !== char);
				let origin = origins2[column - 1];
				const deletion = distances2[column] + 1;
				if (deletion < distance || (deletion === distance && origins2[column] < origin)) {
					distance = deletion;
					origin = origins2[column];
				}
				const insertion = distances[column - 1] + 1;
				if (insertion < distance || (insertion === distance && origins[column - 1] < origin)) {
					distance = insertion;
					origin = origins[column - 1];
				}
				if (column > 1 && prior === char && letter === text[column - 2]) {
					const swap = distances3[column - 2] + 1;
					if (swap < distance || (swap === distance && origins3[column - 2] < origin)) {
						distance = swap;
						origin = origins3[column - 2];
					}
				}
				distances[column] = distance;
				origins[column] = origin;
				if (distance < minimum) minimum = distance;
			}
			if (minimum > budget) return null;
			[older, previous, current] = [previous, current, older];
		}
		return previous.best(width);
	}
}
//#endregion
