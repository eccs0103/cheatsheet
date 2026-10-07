"use strict";

import "adaptive-extender/core";
import { Model, Field } from "adaptive-extender/core";
import { Question, type QuestionScheme } from "./question.js";

//#region Sheet
export interface SheetScheme {
	title: string;
	polls: QuestionScheme[];
}

export class Sheet extends Model {
	static #compact: RegExp = /(\{)\n\s*("text": .+)\n\s*("correctness": .+)\n\s*(\})/g;

	@Field(String, { name: "title" })
	title: string;

	@Field(Array.Of(Question), { name: "polls" })
	questions: Question[];

	constructor();
	constructor(title: string, questions: Question[]);
	constructor(title?: string, questions?: Question[]) {
		if (title === undefined || questions === undefined) {
			super();
			return;
		}

		super();
		this.title = title;
		this.questions = questions;
	}

	get name(): string | null {
		return this.title.insteadWhitespace(null);
	}

	get complete(): boolean {
		const { questions } = this;
		if (questions.length === 0) return false;
		return questions.every(question => question.complete);
	}

	append(text: string): Question {
		const question = new Question(text, []);
		this.questions.push(question);
		return question;
	}

	remove(question: Question): void {
		this.questions = this.questions.filter(item => item !== question);
	}

	toFile(): File {
		const text = JSON.stringify(Sheet.export(this), null, "\t").replace(Sheet.#compact, "$1 $2 $3 $4");
		const { name } = this;
		return new File([text], name ?? String.empty, { type: "application/json" });
	}
}
//#endregion
