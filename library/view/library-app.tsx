"use strict";

import "adaptive-extender/web";
import { type ReactElement, useState } from "react";
import { type Note } from "../models/note.js";
import { type LibraryService } from "../services/library-service.js";
import { NoteRow } from "./note-row.js";
import { AddDialog } from "./add-dialog.js";
import { ActionsBar } from "./actions-bar.js";

//#region Library app
export interface LibraryAppProps {
	library: LibraryService;
}

export function LibraryApp({ library }: LibraryAppProps): ReactElement {
	const [notes, setNotes] = useState<Note[]>(() => library.notes);
	const [editing, setEditing] = useState<boolean>(false);
	const [selection, setSelection] = useState<ReadonlySet<string>>(() => new Set());
	const [adding, setAdding] = useState<boolean>(false);

	const selected = notes.filter(note => selection.has(note.id));
	const complete = notes.length > 0 && selected.length === notes.length;

	const reload = (): void => {
		const fresh = library.notes;
		setNotes(fresh);
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
		setSelection(new Set(notes.map(note => note.id)));
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
				<input id="editing" type="checkbox" hidden checked={editing} disabled={notes.length === 0} onChange={toggle} />
				<label htmlFor="editing" className="with-padding flex alt-center with-gap" title="Edit">
					<span className="icon with-padding small-padding">Edit</span>
				</label>
				<a id="settings" href="../settings/" className="with-padding flex alt-center with-gap" title="Settings">
					<span className="icon with-padding small-padding">Settings</span>
				</a>
			</header>
			<main className="with-padding flex column with-block-gap">
				<p className="description" hidden={notes.length > 0}>No sheets yet. Add one to get started.</p>
				<ul id="notes" className="flex column with-block-gap">
					{notes.map(note => <NoteRow key={note.id} note={note} marked={selection.has(note.id)} onMark={mark} />)}
				</ul>
			</main>
			<ActionsBar library={library} selected={selected} onAdd={() => setAdding(true)} onChange={reload} />
			<AddDialog library={library} open={adding} onClose={() => setAdding(false)} onChange={reload} />
		</>
	);
}
//#endregion
