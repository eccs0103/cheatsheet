"use strict";

import "adaptive-extender/core";
import { Model, Field } from "adaptive-extender/core";

//#region Answer
export interface AnswerScheme {
	text: string;
	correctness: boolean;
}

export class Answer extends Model {
	@Field(String, { name: "text" })
	text: string;

	@Field(Boolean, { name: "correctness" })
	correct: boolean;

	constructor();
	constructor(text: string, correct: boolean);
	constructor(text?: string, correct?: boolean) {
		if (text === undefined || correct === undefined) {
			super();
			return;
		}

		super();
		this.text = text;
		this.correct = correct;
	}

	get complete(): boolean {
		return !String.isWhitespace(this.text);
	}

	visible(incorrect: boolean): boolean {
		if (incorrect) return true;
		return this.correct;
	}

	toggle(): void {
		this.correct = !this.correct;
	}
}
//#endregion
