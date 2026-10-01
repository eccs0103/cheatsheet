"use strict";

import "adaptive-extender/core";
import { Model, Field } from "adaptive-extender/core";
import { Poll, type PollScheme } from "./poll.js";

//#region Sheet
export interface SheetScheme {
	title: string;
	polls: PollScheme[];
}

export class Sheet extends Model {
	static #compact: RegExp = /(\{)\n\s*("text": .+)\n\s*("correctness": .+)\n\s*(\})/g;

	@Field(String, { name: "title" })
	title: string;

	@Field(Array.Of(Poll), { name: "polls" })
	polls: Poll[];

	constructor();
	constructor(title: string, polls: Poll[]);
	constructor(title?: string, polls?: Poll[]) {
		if (title === undefined || polls === undefined) {
			super();
			return;
		}

		super();
		this.title = title;
		this.polls = polls;
	}

	get name(): string {
		const title = this.title.trim();
		if (String.isEmpty(title)) return "Untitled";
		return title;
	}

	get complete(): boolean {
		const { polls } = this;
		if (polls.length === 0) return false;
		return polls.every(poll => poll.complete);
	}

	append(question: string): Poll {
		const poll = new Poll(question, []);
		this.polls.push(poll);
		return poll;
	}

	remove(poll: Poll): void {
		this.polls = this.polls.filter(entry => entry !== poll);
	}

	clone(): Sheet {
		return Sheet.import(Sheet.export(this), "sheet");
	}

	toFile(): File {
		const text = JSON.stringify(Sheet.export(this), null, "\t").replace(Sheet.#compact, "$1 $2 $3 $4");
		return new File([text], `${this.name}.json`, { type: "application/json" });
	}
}
//#endregion
