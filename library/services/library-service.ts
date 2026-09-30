"use strict";

import "adaptive-extender/web";
import { type BufferedCell } from "adaptive-extender/web";
import { Library } from "../models/library.js";
import { type Note } from "../models/note.js";
import { SheetSource } from "../models/sheet-source.js";

//#region Library service
export class LibraryService {
	static #key: string = "Cheatsheet\\Library";
	static #lock: boolean = true;
	static #instance: LibraryService | null = null;
	#cell: BufferedCell<typeof Library>;

	constructor() {
		if (LibraryService.#lock) throw new TypeError("Illegal constructor");

		const key = LibraryService.#key;
		try {
			this.#cell = localStorage.openBufferedCell(key, Library, new Library());
		} catch (reason) {
			if (!(reason instanceof SyntaxError)) throw reason;
			localStorage.removeItem(key);
			this.#cell = localStorage.openBufferedCell(key, Library, new Library());
		}
	}

	static get instance(): LibraryService {
		if (LibraryService.#instance === null) {
			LibraryService.#lock = false;
			LibraryService.#instance = new LibraryService();
			LibraryService.#lock = true;
		}
		return LibraryService.#instance;
	}

	get notes(): Note[] {
		return this.#cell.content.newest;
	}

	find(id: string): Note | null {
		return this.#cell.content.find(id);
	}

	async add(text: string): Promise<Note> {
		const cell = this.#cell;
		const note = cell.content.add(SheetSource.parse(text));
		await cell.save();
		return note;
	}

	async remove(ids: ReadonlySet<string>): Promise<void> {
		const cell = this.#cell;
		cell.content.remove(ids);
		await cell.save();
	}
}
//#endregion
