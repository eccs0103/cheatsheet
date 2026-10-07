"use strict";

import "adaptive-extender/core";
import { Model, Field } from "adaptive-extender/core";
import { Answer, type AnswerScheme } from "./answer.js";

//#region Question
export interface QuestionScheme {
	question: string;
	cases: AnswerScheme[];
}

export class Question extends Model {
	@Field(String, { name: "question" })
	text: string;

	@Field(Array.Of(Answer), { name: "cases" })
	answers: Answer[];

	constructor();
	constructor(text: string, answers: Answer[]);
	constructor(text?: string, answers?: Answer[]) {
		if (text === undefined || answers === undefined) {
			super();
			return;
		}

		super();
		this.text = text;
		this.answers = answers;
	}

	get complete(): boolean {
		const { answers } = this;
		if (String.isWhitespace(this.text)) return false;
		if (answers.length === 0) return false;
		return answers.every(answer => answer.complete);
	}

	visible(incorrect: boolean): Answer[] {
		return this.answers.filter(answer => answer.visible(incorrect));
	}

	append(text: string): Answer {
		const answer = new Answer(text, false);
		this.answers.push(answer);
		return answer;
	}

	remove(answer: Answer): void {
		this.answers.remove(answer);
	}
}
//#endregion
