"use strict";

import "adaptive-extender/web";
import { type Question } from "../../library/models/question.js";

//#region Range
/** The questions to build, by index, and the space the ones before and after them take. */
export class Range {
	static #empty: Range = new Range(0, 0, 0, 0);
	#start: number;
	#end: number;
	#before: number;
	#after: number;

	constructor(start: number, end: number, before: number, after: number) {
		this.#start = start;
		this.#end = end;
		this.#before = before;
		this.#after = after;
	}

	static get empty(): Range { return Range.#empty; }

	get start(): number { return this.#start; }

	get end(): number { return this.#end; }

	equals(range: Range): boolean {
		return this.#start === range.#start && this.#end === range.#end && this.#before === range.#before && this.#after === range.#after;
	}

	place(list: HTMLElement): void {
		const { style } = list;
		style.setProperty("--before", `${this.#before}px`);
		style.setProperty("--after", `${this.#after}px`);
	}
}
//#endregion
//#region Viewport
export interface ViewportEventMap {
	"change": Event;
}

/** Measures the built question cards and works out which questions are near the screen; questions never measured are estimated from the height of a line, calibrated once from the first cards built. */
export class Viewport extends EventTarget {
	#heights: WeakMap<Question, number> = new WeakMap();
	#questions: WeakMap<Element, Question> = new WeakMap();
	#observer: ResizeObserver = new ResizeObserver(this.#resize.bind(this));
	// Fixed after the first measurement: every line of a card is a one-line field, so a later shift of the average would only move every estimate at once and the list under the reader
	#line: number | null = null;

	addEventListener<K extends keyof ViewportEventMap>(type: K, listener: (this: Viewport, event: ViewportEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
		return super.addEventListener(type, listener, options);
	}

	removeEventListener<K extends keyof ViewportEventMap>(type: K, listener: (this: Viewport, event: ViewportEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
		return super.removeEventListener(type, listener, options);
	}

	// The question text, every answer and the insert row each take one line of the card
	static #count(question: Question): number {
		return question.answers.length + 2;
	}

	observe(element: Element, question: Question): void {
		this.#questions.set(element, question);
		this.#observer.observe(element);
	}

	unobserve(element: Element): void {
		this.#observer.unobserve(element);
		this.#questions.delete(element);
	}

	#resize(entries: ResizeObserverEntry[]): void {
		const heights = this.#heights;
		const questions = this.#questions;
		let changed = false;
		let measured = 0;
		let lines = 0;
		for (const { target, borderBoxSize } of entries) {
			// A card being unbuilt reports a zero size before it is unobserved; that is not its height
			if (!target.isConnected) continue;
			const question = questions.get(target);
			if (question === undefined) continue;
			const [box] = borderBoxSize;
			const height = box.blockSize;
			const previous = heights.get(question);
			if (previous === height) continue;
			heights.set(question, height);
			changed = true;
			measured += height;
			lines += Viewport.#count(question);
		}
		if (this.#line === null && lines > 0) this.#line = measured / lines;
		if (!changed) return;
		this.dispatchEvent(new Event("change"));
	}

	// ponytail: one pass over every question per scroll event (about a millisecond for 14k); keep prefix sums of the heights if sheets grow far beyond that
	range(list: HTMLElement, questions: readonly Question[], top: number, height: number): Range {
		const heights = this.#heights;
		const style = window.getComputedStyle(list);
		const gap = Number.parseFloat(style.rowGap);
		// Before anything is measured, a line is as tall as the list's `--row` token
		const line = this.#line ?? Number.parseFloat(style.getPropertyValue("--row"));
		const from = top - height / 2;
		const to = top + height * 1.5;
		const { length } = questions;
		let start = length;
		let end = length;
		let before = 0;
		let after = 0;
		let offset = 0;
		for (let index = 0; index < length; index++) {
			const question = questions[index];
			const size = (heights.get(question) ?? line * Viewport.#count(question)) + gap;
			if (index < start && offset + size > from) {
				start = index;
				before = offset;
			}
			if (index >= start && end === length && offset >= to) end = index;
			if (index >= end) after += size;
			offset += size;
		}
		if (start === length) before = offset;
		return new Range(start, end, before, after);
	}
}
//#endregion
