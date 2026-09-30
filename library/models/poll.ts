"use strict";

import "adaptive-extender/core";
import { Model, Field } from "adaptive-extender/core";
import { Case, type CaseScheme } from "./case.js";

//#region Poll
export interface PollScheme {
	question: string;
	cases: CaseScheme[];
}

export class Poll extends Model {
	@Field(String, { name: "question" })
	question: string;

	@Field(Array.Of(Case), { name: "cases" })
	cases: Case[];

	constructor();
	constructor(question: string, cases: Case[]);
	constructor(question?: string, cases?: Case[]) {
		if (question === undefined || cases === undefined) {
			super();
			return;
		}

		super();
		this.question = question;
		this.cases = cases;
	}

	visible(incorrect: boolean): Case[] {
		return this.cases.filter(item => item.visible(incorrect));
	}
}
//#endregion
