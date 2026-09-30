"use strict";

import "adaptive-extender/core";
import { Model, Field } from "adaptive-extender/core";
import { Note, type NoteScheme } from "./note.js";
import { type Sheet } from "./sheet.js";

//#region Library
export interface LibraryScheme {
	notes: NoteScheme[];
}

export class Library extends Model {
	@Field(Array.Of(Note), { name: "notes" })
	notes: Note[];

	constructor();
	constructor(notes: Note[]);
	constructor(notes?: Note[]) {
		if (notes === undefined) {
			super();
			return;
		}

		super();
		this.notes = notes;
	}

	get newest(): Note[] {
		return this.notes.toReversed();
	}

	add(sheet: Sheet): Note {
		const note = new Note(crypto.randomUUID(), new Date(), sheet);
		this.notes.push(note);
		return note;
	}

	remove(ids: ReadonlySet<string>): void {
		this.notes = this.notes.filter(note => !ids.has(note.id));
	}

	find(id: string): Note | null {
		const note = this.notes.find(entry => entry.id === id);
		if (note === undefined) return null;
		return note;
	}
}
//#endregion
