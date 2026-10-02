"use strict";

import "adaptive-extender/core";
import { Model, Field } from "adaptive-extender/core";
import { Entry, type EntryScheme } from "./entry.js";

//#region Library
export interface LibraryScheme {
	notes: EntryScheme[];
}

export class Library extends Model {
	@Field(Array.Of(Entry), { name: "notes" })
	entries: Entry[];

	constructor();
	constructor(entries: Entry[]);
	constructor(entries?: Entry[]) {
		if (entries === undefined) {
			super();
			return;
		}

		super();
		this.entries = entries;
	}
}
//#endregion
