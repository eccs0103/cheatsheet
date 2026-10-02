"use strict";

import "adaptive-extender/web";
import { type BufferedCell } from "adaptive-extender/web";
import { Library } from "../models/library.js";
import { type Entry } from "../models/entry.js";
import { Sheet } from "../models/sheet.js";

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
			this.#cell = localStorage.openBufferedCell(key, Library, new Library([]));
		} catch (reason) {
			if (!(reason instanceof SyntaxError)) throw reason;
			localStorage.removeItem(key);
			this.#cell = localStorage.openBufferedCell(key, Library, new Library([]));
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

	get entries(): Entry[] {
		return this.#cell.content.newest;
	}

	find(id: string): Entry | null {
		return this.#cell.content.find(id);
	}

	async add(files: readonly File[]): Promise<void> {
		const cell = this.#cell;
		const { content } = cell;
		const errors: Error[] = [];
		for (const file of files) {
			try {
				content.add(Sheet.import(JSON.parse(await file.text()), "sheet"));
			} catch (reason) {
				errors.push(new Error(`${file.name}: ${Error.from(reason).message}`, { cause: reason }));
			}
		}
		await cell.save();
		if (errors.length === 0) return;
		throw new AggregateError(errors, `Unable to add ${errors.length} of ${files.length} sheet(s):\n${errors.map(error => error.message).join("\n")}`);
	}

	async insert(sheet: Sheet): Promise<Entry> {
		const cell = this.#cell;
		const entry = cell.content.add(sheet);
		await cell.save();
		return entry;
	}

	async replace(id: string, sheet: Sheet): Promise<Entry> {
		const cell = this.#cell;
		const entry = cell.content.replace(id, sheet);
		await cell.save();
		return entry;
	}

	async remove(ids: ReadonlySet<string>): Promise<void> {
		const cell = this.#cell;
		cell.content.remove(ids);
		await cell.save();
	}
}
//#endregion
