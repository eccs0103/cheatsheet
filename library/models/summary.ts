"use strict";

import "adaptive-extender/core";
import { Model, Field } from "adaptive-extender/core";
import { type Entry } from "./entry.js";

//#region Summary
export interface SummaryScheme {
	id: string;
	date: string;
	title: string;
}

export class Summary extends Model {
	@Field(String, { name: "id" })
	id: string;

	@Field(Date, { name: "date" })
	date: Date;

	@Field(String, { name: "title" })
	title: string;

	constructor();
	constructor(id: string, date: Date, title: string);
	constructor(id?: string, date?: Date, title?: string) {
		if (id === undefined || date === undefined || title === undefined) {
			super();
			return;
		}

		super();
		this.id = id;
		this.date = date;
		this.title = title;
	}

	static of(entry: Entry): Summary {
		return new Summary(entry.id, entry.date, entry.sheet.title);
	}

	get name(): string | null {
		return this.title.insteadWhitespace(null);
	}

	get link(): string {
		return `../search/?sheet=${encodeURIComponent(this.id)}`;
	}

	get editor(): string {
		return `../editor/?sheet=${encodeURIComponent(this.id)}`;
	}
}
//#endregion
