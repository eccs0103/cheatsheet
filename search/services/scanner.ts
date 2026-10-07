"use strict";

import "adaptive-extender/web";
import { FastEngine } from "adaptive-extender/web";
import { type Question } from "../../library/models/question.js";
import { type Settings } from "../../settings/models/settings.js";
import { Matches } from "../models/matches.js";
import { type Token } from "../models/token.js";
import { Folding } from "./folding.js";
import { Query } from "./query.js";

//#region Scanner
export interface ScannerEventMap {
	"change": Event;
}

/** Tests the questions against a query a few milliseconds per frame, so typing stays smooth on large sheets; a new query restarts the scan, and `change` fires when one completes. */
export class Scanner extends EventTarget {
	static #slice: number = 8;
	#questions: readonly Question[];
	#folding: Folding;
	#skipping: boolean;
	#tolerant: boolean;
	#engine: FastEngine = new FastEngine();
	#index: Token[][] = [];
	#query: Query;
	#position: number = 0;
	#pending: Matches = new Matches();
	#matches: Matches;

	constructor(questions: readonly Question[], settings: Readonly<Settings>) {
		super();
		const { sensitive, accents, skipping, tolerant } = settings;
		const folding = new Folding(sensitive, accents);
		this.#questions = questions;
		this.#folding = folding;
		this.#skipping = skipping;
		this.#tolerant = tolerant;
		this.#query = new Query(String.empty, folding, skipping, tolerant);
		this.#matches = Matches.all(questions.length);
		this.#engine.addEventListener("trigger", this.#step.bind(this));
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
		const engine = this.#engine;
		if (query.blank) {
			engine.launched = false;
			return this.#finish(Matches.all(this.#questions.length));
		}
		this.#query = query;
		this.#position = 0;
		this.#pending = new Matches();
		engine.launched = true;
	}

	// Scans always run from the first question, so the token cache only ever grows at its end
	#tokens(position: number): Token[] {
		const index = this.#index;
		if (position < index.length) return index[position];
		const tokens = this.#folding.tokenize(this.#questions[position].text);
		index.push(tokens);
		return tokens;
	}

	#step(event: Event): void {
		const { length } = this.#questions;
		const query = this.#query;
		const pending = this.#pending;
		const deadline = performance.now() + Scanner.#slice;
		let position = this.#position;
		while (position < length && performance.now() < deadline) {
			const marks = query.test(this.#tokens(position));
			if (marks !== null) pending.add(position, marks);
			position++;
		}
		this.#position = position;
		if (position < length) return;
		this.#engine.launched = false;
		this.#finish(pending);
	}

	#finish(matches: Matches): void {
		this.#matches = matches;
		this.dispatchEvent(new Event("change"));
	}
}
//#endregion
