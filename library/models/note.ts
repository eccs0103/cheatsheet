"use strict";

import "adaptive-extender/core";
import { Model, Field } from "adaptive-extender/core";
import { Sheet, type SheetScheme } from "./sheet.js";

//#region Note
export interface NoteScheme {
	id: string;
	date: string;
	sheet: SheetScheme;
}

export class Note extends Model {
	@Field(String, { name: "id" })
	id: string;

	@Field(Date, { name: "date" })
	date: Date;

	@Field(Sheet, { name: "sheet" })
	sheet: Sheet;

	constructor();
	constructor(id: string, date: Date, sheet: Sheet);
	constructor(id?: string, date?: Date, sheet?: Sheet) {
		if (id === undefined || date === undefined || sheet === undefined) {
			super();
			return;
		}

		super();
		this.id = id;
		this.date = date;
		this.sheet = sheet;
	}

	get link(): string {
		return `../finder/?sheet=${encodeURIComponent(this.id)}`;
	}

	get editor(): string {
		return `../editor/?sheet=${encodeURIComponent(this.id)}`;
	}
}
//#endregion
