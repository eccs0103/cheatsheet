"use strict";

import "adaptive-extender/web";
import { type Question } from "../../library/models/question.js";
import { type Token } from "../models/token.js";
import { type Folding } from "./folding.js";

//#region Word index
export class WordIndex {
	#questions: readonly Question[];
	#folding: Folding;
	#answers: boolean;
	#incorrect: boolean;
	#fields: Token[][][] = [];
	#ids: Map<string, number> = new Map();
	#words: string[] = [];
	#postings: number[][] = [];

	constructor(questions: readonly Question[], folding: Folding, answers: boolean, incorrect: boolean) {
		this.#questions = questions;
		this.#folding = folding;
		this.#answers = answers;
		this.#incorrect = incorrect;
	}

	get count(): number { return this.#questions.length; }
	get words(): readonly string[] { return this.#words; }

	fields(position: number): readonly Token[][] {
		return this.#fields[position];
	}

	postings(id: number): readonly number[] {
		return this.#postings[id];
	}

	intern(word: string): number {
		const ids = this.#ids;
		const known = ids.get(word);
		if (known !== undefined) return known;
		const words = this.#words;
		const id = words.length;
		ids.set(word, id);
		words.push(word);
		this.#postings.push([]);
		return id;
	}

	prepare(deadline: number): boolean {
		const questions = this.#questions;
		const fields = this.#fields;
		while (fields.length < questions.length && performance.now() < deadline) {
			this.#add(questions[fields.length]);
		}
		return fields.length === questions.length;
	}

	#add(question: Question): void {
		const fields = this.#fields;
		const postings = this.#postings;
		const position = fields.length;
		const folding = this.#folding;
		const tokens = this.#texts(question).map(text => folding.tokenize(text, this));
		fields.push(tokens);
		for (const list of tokens) {
			for (const token of list) {
				const posting = postings[token.id];
				if (posting.at(-1) !== position) posting.push(position);
			}
		}
	}

	// The same texts, in the same order, as the card's `span.text` elements
	#texts(question: Question): string[] {
		const texts = [question.text];
		if (!this.#answers) return texts;
		for (const answer of question.visible(this.#incorrect)) {
			texts.push(answer.text);
		}
		return texts;
	}
}
//#endregion
