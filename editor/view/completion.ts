"use strict";

import "adaptive-extender/web";
import { type Question } from "../../library/models/question.js";
import { type Sheet } from "../../library/models/sheet.js";

//#region Completion
/** Whether a sheet is complete, kept up to date one edited question at a time instead of checking the whole sheet on every keystroke. */
export class Completion {
	#sheet: Sheet;
	#incomplete: Set<Question> = new Set();

	constructor(sheet: Sheet) {
		this.#sheet = sheet;
		for (const question of sheet.questions) {
			this.revise(question);
		}
	}

	/** The same as `Sheet.complete`: at least one question, and every question complete. */
	get complete(): boolean {
		return this.#sheet.questions.length > 0 && this.#incomplete.size === 0;
	}

	revise(question: Question): void {
		const incomplete = this.#incomplete;
		if (question.complete) {
			incomplete.delete(question);
			return;
		}
		incomplete.add(question);
	}

	forget(question: Question): void {
		this.#incomplete.delete(question);
	}
}
//#endregion
