"use strict";

import "adaptive-extender/core";
import { Model, Field } from "adaptive-extender/core";
import { type Entry } from "./entry.js";
import { Summary, type SummaryScheme } from "./summary.js";

//#region Catalog
export interface CatalogScheme {
	summaries: SummaryScheme[];
}

export class Catalog extends Model {
	@Field(Array.Of(Summary), { name: "summaries" })
	summaries: Summary[] = [];

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
		this.summaries = Array.from(entries, Summary.of);
	}
}
//#endregion
