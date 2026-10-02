"use strict";

import "adaptive-extender/web";
import { Library } from "../models/library.js";
import { Entry } from "../models/entry.js";
import { Sheet } from "../models/sheet.js";
import { ObjectStore } from "./object-store.js";

//#region Library service
export class LibraryService {
	static #legacy: string = "Cheatsheet\\Library";
	#store: ObjectStore;

	constructor(store: ObjectStore) {
		this.#store = store;
	}

	static async open(): Promise<LibraryService> {
		const library = new LibraryService(new ObjectStore("Cheatsheet", "Library"));
		await library.#migrate();
		return library;
	}

	// Libraries saved before IndexedDB live in one localStorage value; it is removed only after every entry is stored
	async #migrate(): Promise<void> {
		const key = LibraryService.#legacy;
		const text = localStorage.getItem(key);
		if (text === null) return;
		let source: unknown;
		try {
			source = JSON.parse(text);
		} catch (reason) {
			if (!(reason instanceof SyntaxError)) throw reason;
			localStorage.removeItem(key);
			return;
		}
		const { entries } = Library.import(source, "library");
		for (const entry of entries) {
			await this.#put(entry);
		}
		localStorage.removeItem(key);
	}

	async list(): Promise<Entry[]> {
		const values = await this.#store.values();
		return values.map(value => Entry.import(value, "entry")).sort((left, right) => right.date.getTime() - left.date.getTime());
	}

	async find(id: string): Promise<Entry | null> {
		const value = await this.#store.get(id);
		if (value === undefined) return null;
		return Entry.import(value, "entry");
	}

	async add(files: readonly File[]): Promise<void> {
		const errors: Error[] = [];
		for (const file of files) {
			try {
				await this.#put(Entry.of(Sheet.import(JSON.parse(await file.text()), "sheet")));
			} catch (reason) {
				errors.push(new Error(`${file.name}: ${Error.from(reason).message}`, { cause: reason }));
			}
		}
		if (errors.length === 0) return;
		throw new AggregateError(errors, `Unable to add ${errors.length} of ${files.length} sheet(s):\n${errors.map(error => error.message).join("\n")}`);
	}

	async insert(sheet: Sheet): Promise<void> {
		await this.#put(Entry.of(sheet));
	}

	async replace(id: string, sheet: Sheet): Promise<void> {
		const entry = await this.find(id);
		if (entry === null) throw new ReferenceError(`Unable to find the sheet '${id}'`);
		entry.revise(sheet);
		await this.#put(entry);
	}

	async remove(ids: ReadonlySet<string>): Promise<void> {
		const store = this.#store;
		for (const id of ids) {
			await store.delete(id);
		}
	}

	async #put(entry: Entry): Promise<void> {
		try {
			await this.#store.put(entry.id, Entry.export(entry));
		} catch (reason) {
			throw LibraryService.#explain(reason);
		}
	}

	static #explain(reason: unknown): Error {
		const error = Error.from(reason);
		if (error.name !== "QuotaExceededError") return error;
		return new Error("Not enough browser storage for these sheets. Delete some sheets and try again.", { cause: reason });
	}
}
//#endregion
