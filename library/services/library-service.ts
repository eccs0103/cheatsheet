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
		const ids: Set<string> = new Set();
		for (const file of files) {
			try {
				ids.add(content.add(Sheet.import(JSON.parse(await file.text()), "sheet")).id);
			} catch (reason) {
				errors.push(new Error(`${file.name}: ${Error.from(reason).message}`, { cause: reason }));
			}
		}
		try {
			await cell.save();
		} catch (reason) {
			content.remove(ids);
			throw LibraryService.#explain(reason);
		}
		if (errors.length === 0) return;
		throw new AggregateError(errors, `Unable to add ${errors.length} of ${files.length} sheet(s):\n${errors.map(error => error.message).join("\n")}`);
	}

	async insert(sheet: Sheet): Promise<void> {
		const cell = this.#cell;
		const { content } = cell;
		const entry = content.add(sheet);
		try {
			await cell.save();
		} catch (reason) {
			content.remove(new Set([entry.id]));
			throw LibraryService.#explain(reason);
		}
	}

	async replace(id: string, sheet: Sheet): Promise<void> {
		const cell = this.#cell;
		const { content } = cell;
		const previous = content.replace(id, sheet);
		try {
			await cell.save();
		} catch (reason) {
			content.replace(id, previous);
			throw LibraryService.#explain(reason);
		}
	}

	static #explain(reason: unknown): Error {
		const error = Error.from(reason);
		if (error.name !== "QuotaExceededError") return error;
		return new Error("Not enough browser storage for these sheets. Delete some sheets and try again.", { cause: reason });
	}

	async remove(ids: ReadonlySet<string>): Promise<void> {
		const cell = this.#cell;
		cell.content.remove(ids);
		await cell.save();
	}
}
//#endregion
