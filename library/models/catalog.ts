"use strict";

import "adaptive-extender/core";
import { Model, Field } from "adaptive-extender/core";
import { type Entry } from "./entry.js";
import { Summary, type SummaryScheme } from "./summary.js";

//#region Catalog
export interface CatalogScheme {
	summaries: SummaryScheme[];
}

/** The list of sheets shown in the library, kept apart from the sheets themselves so it loads without them. */
export class Catalog extends Model {
	@Field(Array.Of(Summary), { name: "summaries" })
	summaries: Summary[];

	constructor();
	constructor(summaries: Summary[]);
	constructor(summaries?: Summary[]) {
		if (summaries === undefined) {
			super();
			return;
		}

		super();
		this.summaries = summaries;
	}

	get size(): number { return this.summaries.length; }

	list(): Summary[] {
		return this.summaries.toSorted((left, right) => right.date.getTime() - left.date.getTime());
	}

	add(entry: Entry): void {
		this.summaries.push(Summary.of(entry));
	}

	revise(entry: Entry): void {
		const { id } = entry;
		this.summaries = this.summaries.map(summary => summary.id === id ? Summary.of(entry) : summary);
	}

	remove(ids: ReadonlySet<string>): void {
		this.summaries = this.summaries.filter(summary => !ids.has(summary.id));
	}

	reconcile(entries: Iterable<Entry>): void {
		const summaries: Summary[] = [];
		for (const entry of entries) {
			summaries.push(Summary.of(entry));
		}
		this.summaries = summaries;
	}
}
//#endregion
