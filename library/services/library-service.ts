"use strict";

import "adaptive-extender/web";
import { type PortableStore } from "adaptive-extender/web";
import { Library } from "../models/library.js";
import { Entry } from "../models/entry.js";
import { Sheet } from "../models/sheet.js";

//#region Library service
export class LibraryService {
	static #legacy: string = "Cheatsheet\\Library";
	#store: PortableStore<typeof Entry, "id">;

	constructor(store: PortableStore<typeof Entry, "id">) {
		this.#store = store;
	}

	static async open(): Promise<LibraryService> {
		const library = new LibraryService(indexedDB.openPortableStore("Cheatsheet", "Library", Entry, "id"));
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
		try {
			await this.#store.insert(entries);
		} catch (reason) {
			// Another tab that migrated the same entries first leaves nothing to add
			if (!(reason instanceof DOMException) || reason.name !== "ConstraintError") throw LibraryService.#explain(reason);
		}
		localStorage.removeItem(key);
	}

	async list(): Promise<Entry[]> {
		const entries = await this.#store.select();
		return entries.sort((left, right) => right.date.getTime() - left.date.getTime());
	}

	async find(id: string): Promise<Entry | null> {
		return await this.#store.select(id);
	}

	async add(files: readonly File[]): Promise<void> {
		const store = this.#store;
		const errors: Error[] = [];
		for (const file of files) {
			try {
				await LibraryService.#guard(store.insert(Entry.of(Sheet.import(JSON.parse(await file.text()), "sheet"))));
			} catch (reason) {
				errors.push(new Error(`${file.name}: ${Error.from(reason).message}`, { cause: reason }));
			}
		}
		if (errors.length === 0) return;
		throw new AggregateError(errors, `Unable to add ${errors.length} of ${files.length} sheet(s):\n${errors.map(error => error.message).join("\n")}`);
	}

	// The source address is the entry id, so the same link refreshes its sheet instead of adding a copy; `no-cache` lets the browser revalidate by ETag, so an unchanged sheet is not downloaded again
	// ponytail: a local edit to a linked sheet is overwritten on the next pull even when the source is unchanged; store the ETag on the entry if that matters
	async pull(address: Readonly<URL>): Promise<Entry> {
		const response = await fetch(address, { cache: "no-cache" });
		if (!response.ok) throw new ReferenceError(`Unable to download the sheet: ${response.status} ${response.statusText}`);
		const sheet = Sheet.import(await response.json(), "sheet");
		const { href } = address;
		const entry = await this.find(href);
		if (entry !== null) {
			await this.replace(href, sheet);
			return entry;
		}
		const fresh = new Entry(href, new Date(), sheet);
		await LibraryService.#guard(this.#store.insert(fresh));
		return fresh;
	}

	async insert(sheet: Sheet): Promise<void> {
		await LibraryService.#guard(this.#store.insert(Entry.of(sheet)));
	}

	async replace(id: string, sheet: Sheet): Promise<void> {
		const entry = await this.find(id);
		if (entry === null) throw new ReferenceError(`Unable to find the sheet '${id}'`);
		entry.revise(sheet);
		await LibraryService.#guard(this.#store.update(entry));
	}

	async remove(ids: ReadonlySet<string>): Promise<void> {
		await this.#store.delete(ids);
	}

	static async #guard(operation: Promise<void>): Promise<void> {
		try {
			await operation;
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
