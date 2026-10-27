"use strict";

import "adaptive-extender/web";
import { FastEngine } from "adaptive-extender/web";
import { type Question } from "../../library/models/question.js";
import { type Settings } from "../../settings/models/settings.js";
import { Matches } from "../models/matches.js";
import { type Mark } from "../models/mark.js";
import { type Token } from "../models/token.js";
import { Folding } from "./folding.js";
import { Query } from "./query.js";
import { WordIndex } from "./word-index.js";

//#region Scanner
export interface ScannerEventMap {
	"change": Event;
}

export class Scanner extends EventTarget {
	static #slice: number = 8;
	// Reading the clock costs about as much as testing a question that cannot match, so it is read once per batch
	static #batch: number = 64;
	#folding: Folding;
	#skipping: boolean;
	#tolerant: boolean;
	#index: WordIndex;
	#engine: FastEngine = new FastEngine();
	#query: Query | null = null;
	#position: number = 0;
	#pending: Matches = new Matches();
	#matches: Matches;

	constructor(questions: readonly Question[], settings: Readonly<Settings>) {
		super();
		const { sensitive, accents, skipping, tolerant, answers, incorrect } = settings;
		const folding = new Folding(sensitive, accents);
		this.#folding = folding;
		this.#skipping = skipping;
		this.#tolerant = tolerant;
		this.#index = new WordIndex(questions, folding, answers, incorrect);
		this.#matches = Matches.all(questions.length);
		const engine = this.#engine;
		engine.addEventListener("trigger", this.#step.bind(this));
		engine.launched = true;
	}

	addEventListener<K extends keyof ScannerEventMap>(type: K, listener: (this: Scanner, event: ScannerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
		return super.addEventListener(type, listener, options);
	}

	removeEventListener<K extends keyof ScannerEventMap>(type: K, listener: (this: Scanner, event: ScannerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
		return super.removeEventListener(type, listener, options);
	}

	get matches(): Matches { return this.#matches; }

	scan(text: string): void {
		const query = new Query(text, this.#folding, this.#skipping, this.#tolerant);
		if (query.blank) {
			this.#query = null;
			return this.#finish(Matches.all(this.#index.count));
		}
		this.#query = query;
		this.#position = 0;
		this.#pending = new Matches();
		this.#engine.launched = true;
	}

	#test(query: Query, fields: readonly Token[][]): Mark[][] | null {
		const marks: Mark[][] = [];
		let found = false;
		for (const tokens of fields) {
			const result = query.test(tokens);
			if (result !== null) found = true;
			marks.push(result ?? []);
		}
		if (!found) return null;
		return marks;
	}

	#step(event: Event): void {
		const deadline = performance.now() + Scanner.#slice;
		const index = this.#index;
		if (!index.prepare(deadline)) return;
		const query = this.#query;
		const engine = this.#engine;
		if (query === null) {
			engine.launched = false;
			return;
		}
		if (!query.narrow(index, deadline)) return;
		const { count } = index;
		const pending = this.#pending;
		let position = this.#position;
		for (; position < count; position++) {
			if (position % Scanner.#batch === 0 && performance.now() >= deadline) break;
			if (!query.admits(position)) continue;
			const marks = this.#test(query, index.fields(position));
			if (marks === null) continue;
			pending.add(position, marks);
		}
		this.#position = position;
		if (position < count) return;
		this.#query = null;
		engine.launched = false;
		this.#finish(pending);
	}

	#finish(matches: Matches): void {
		this.#matches = matches;
		this.dispatchEvent(new Event("change"));
	}
}
//#endregion
