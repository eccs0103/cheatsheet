"use strict";

import "adaptive-extender/core";
import { Model, Field } from "adaptive-extender/core";
import { Entry, type EntryScheme } from "./entry.js";
import { type Sheet } from "./sheet.js";

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

	get newest(): Entry[] {
		return this.entries.toReversed();
	}

	add(sheet: Sheet): Entry {
		const entry = new Entry(crypto.randomUUID(), new Date(), sheet);
		this.entries.push(entry);
		return entry;
	}

	remove(ids: ReadonlySet<string>): void {
		this.entries = this.entries.filter(entry => !ids.has(entry.id));
	}

	find(id: string): Entry | null {
		const entry = this.entries.find(item => item.id === id);
		if (entry === undefined) return null;
		return entry;
	}

	replace(id: string, sheet: Sheet): Sheet {
		const entry = this.find(id);
		if (entry === null) throw new ReferenceError(`Unable to find the sheet '${id}'`);
		const previous = entry.sheet;
		entry.revise(sheet);
		return previous;
	}
}
//#endregion
