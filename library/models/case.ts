"use strict";

import "adaptive-extender/core";
import { Model, Field } from "adaptive-extender/core";

//#region Case
export interface CaseScheme {
	text: string;
	correctness: boolean;
}

export class Case extends Model {
	@Field(String, { name: "text" })
	text: string;

	@Field(Boolean, { name: "correctness" })
	correctness: boolean;

	constructor();
	constructor(text: string, correctness: boolean);
	constructor(text?: string, correctness?: boolean) {
		if (text === undefined || correctness === undefined) {
			super();
			return;
		}

		super();
		this.text = text;
		this.correctness = correctness;
	}

	visible(incorrect: boolean): boolean {
		if (incorrect) return true;
		return this.correctness;
	}
}
//#endregion
