"use strict";

import "adaptive-extender/web";
import { type ReactElement, useState } from "react";
import { type Summary } from "../models/summary.js";
import { type LibraryService } from "../services/library-service.js";
import { EntryRow } from "./entry-row.js";
import { AddDialog } from "./add-dialog.js";
import { ActionsBar } from "./actions-bar.js";

//#region Library app
export interface LibraryAppProps {
	library: LibraryService;
	initial: Summary[];
}

export function LibraryApp({ library, initial }: LibraryAppProps): ReactElement {
	const [entries, setEntries] = useState<Summary[]>(initial);
	const [editing, setEditing] = useState<boolean>(false);
	const [selection, setSelection] = useState<ReadonlySet<string>>(() => new Set());
	const [adding, setAdding] = useState<boolean>(false);

	const selected = entries.filter(entry => selection.has(entry.id));
	const complete = entries.length > 0 && selected.length === entries.length;

	const reload = (): void => {
		const fresh = library.list();
		setEntries(fresh);
		setSelection(new Set());
		if (fresh.length > 0) return;
		setEditing(false);
	};

	const toggle = (): void => {
		setEditing(!editing);
		setSelection(new Set());
	};

	const select = (): void => {
		if (complete) {
			setSelection(new Set());
			return;
		}
		setSelection(new Set(entries.map(entry => entry.id)));
	};

	const mark = (id: string): void => {
		const next = new Set(selection);
		if (!next.delete(id)) next.add(id);
		setSelection(next);
	};

	return (
		<>
			<header className="layer rounded in-top">
				<input id="select-all" type="checkbox" hidden checked={complete} onChange={select} />
				<label htmlFor="select-all" className="with-padding flex alt-center with-gap" title="Mark all">
					<span className="icon with-padding small-padding">Mark all</span>
				</label>
				<h3 className="with-inline-padding">
					<span>Library</span>
					<span className="description"> · {selected.length} selected</span>
				</h3>
				<input id="editing" type="checkbox" hidden checked={editing} disabled={entries.length === 0} onChange={toggle} />
				<label htmlFor="editing" className="with-padding flex alt-center with-gap" title="Edit">
					<span className="icon with-padding small-padding">Edit</span>
				</label>
				<a id="settings" href="../settings/" className="with-padding flex alt-center with-gap" title="Settings">
					<span className="icon with-padding small-padding">Settings</span>
				</a>
			</header>
			<main className="with-padding flex column with-block-gap">
				<p className="description" hidden={entries.length > 0}>No sheets yet. Add one to get started.</p>
				<ul id="entries" className="flex column with-block-gap">
					{entries.map(entry => <EntryRow key={entry.id} entry={entry} marked={selection.has(entry.id)} onMark={mark} />)}
				</ul>
			</main>
			<ActionsBar library={library} selected={selected} onAdd={() => setAdding(true)} onChange={reload} />
			<AddDialog library={library} open={adding} onClose={() => setAdding(false)} onChange={reload} />
		</>
	);
}
//#endregion
