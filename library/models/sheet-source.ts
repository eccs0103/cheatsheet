"use strict";

import "adaptive-extender/core";
import { Model, Field, Any } from "adaptive-extender/core";
import { Case } from "./case.js";
import { Poll } from "./poll.js";
import { Sheet } from "./sheet.js";

//#region Listed poll
/**
 * Legacy poll: every case is a string and `answer` is the index of the correct one.
 */
export interface ListedPollScheme {
	question: string;
	answer: number;
	cases: string[];
}

export class ListedPoll extends Model {
	@Field(String, { name: "question" })
	question: string;

	@Field(Number, { name: "answer" })
	answer: number;

	@Field(Array.Of(String), { name: "cases" })
	cases: string[];

	constructor();
	constructor(question: string, answer: number, cases: string[]);
	constructor(question?: string, answer?: number, cases?: string[]) {
		if (question === undefined || answer === undefined || cases === undefined) {
			super();
			return;
		}

		super();
		this.question = question;
		this.answer = answer;
		this.cases = cases;
	}

	toPoll(): Poll {
		const { answer } = this;
		return new Poll(this.question, this.cases.map((text, index) => new Case(text, index === answer)));
	}
}
//#endregion
//#region Single poll
/**
 * Legacy poll: one case as a plain string, correct when `answer` is 0.
 */
export interface SinglePollScheme {
	question: string;
	answer: number;
	cases: string;
}

export class SinglePoll extends Model {
	@Field(String, { name: "question" })
	question: string;

	@Field(Number, { name: "answer" })
	answer: number;

	@Field(String, { name: "cases" })
	cases: string;

	constructor();
	constructor(question: string, answer: number, cases: string);
	constructor(question?: string, answer?: number, cases?: string) {
		if (question === undefined || answer === undefined || cases === undefined) {
			super();
			return;
		}

		super();
		this.question = question;
		this.answer = answer;
		this.cases = cases;
	}

	toPoll(): Poll {
		return new Poll(this.question, [new Case(this.cases, this.answer === 0)]);
	}
}
//#endregion
//#region Sheet source
interface PollReader {
	(source: unknown, name: string): Poll;
}

/**
 * A sheet as it arrives from a file or a link: its polls may be in the current or in a legacy format.
 */
export interface SheetSourceScheme {
	title: string;
	polls: unknown[];
}

export class SheetSource extends Model {
	static #readers: PollReader[] = [
		(source, name) => Poll.import(source, name),
		(source, name) => ListedPoll.import(source, name).toPoll(),
		(source, name) => SinglePoll.import(source, name).toPoll(),
	];

	@Field(String, { name: "title" })
	title: string;

	@Field(Array.Of(Any), { name: "polls" })
	polls: unknown[];

	constructor();
	constructor(title: string, polls: unknown[]);
	constructor(title?: string, polls?: unknown[]) {
		if (title === undefined || polls === undefined) {
			super();
			return;
		}

		super();
		this.title = title;
		this.polls = polls;
	}

	static parse(text: string): Sheet {
		return SheetSource.import(JSON.parse(text), "sheet").toSheet();
	}

	static #read(source: unknown, name: string): Poll {
		const errors: Error[] = [];
		for (const reader of SheetSource.#readers) {
			try {
				return reader(source, name);
			} catch (reason) {
				errors.push(Error.from(reason));
			}
		}
		throw new SyntaxError(`Unable to read ${name}`, { cause: new AggregateError(errors) });
	}

	toSheet(): Sheet {
		return new Sheet(this.title, this.polls.map((poll, index) => SheetSource.#read(poll, `sheet.polls[${index}]`)));
	}
}
//#endregion
