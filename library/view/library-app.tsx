"use strict";

import "adaptive-extender/web";
import { type ReactElement, useState } from "react";
import { type Note } from "../models/note.js";
import { type LibraryService } from "../services/library-service.js";
import { NoteRow } from "./note-row.js";
import { AddDialog } from "./add-dialog.js";
import { ActionsDialog } from "./actions-dialog.js";

//#region Panel
enum Panel {
	none = "none",
	add = "add",
	actions = "actions",
}
//#endregion
//#region Library app
export interface LibraryAppProps {
	library: LibraryService;
}

export function LibraryApp({ library }: LibraryAppProps): ReactElement {
	const [notes, setNotes] = useState<Note[]>(() => library.notes);
	const [editing, setEditing] = useState<boolean>(false);
	const [selection, setSelection] = useState<ReadonlySet<string>>(() => new Set());
	const [panel, setPanel] = useState<Panel>(Panel.none);

	const selected = notes.filter(note => selection.has(note.id));
	const complete = notes.length > 0 && selected.length === notes.length;

	const handleChange = (): void => {
		const fresh = library.notes;
		setNotes(fresh);
		setSelection(new Set());
		if (fresh.length > 0) return;
		setEditing(false);
	};

	const handleEditing = (): void => {
		setEditing(!editing);
		setSelection(new Set());
	};

	const handleSelectAll = (): void => {
		if (complete) {
			setSelection(new Set());
			return;
		}
		setSelection(new Set(notes.map(note => note.id)));
	};

	const handleMark = (id: string): void => {
		const next = new Set(selection);
		if (!next.delete(id)) next.add(id);
		setSelection(next);
	};

	const handleClose = (): void => setPanel(Panel.none);

	return (
		<>
			<header className="layer rounded in-top">
				<input id="select-all" type="checkbox" hidden checked={complete} onChange={handleSelectAll} />
				<label htmlFor="select-all" className="with-padding flex alt-center with-gap" title="Mark all">
					<span className="icon with-padding small-padding">Mark all</span>
				</label>
				<input id="editing" type="checkbox" hidden checked={editing} onChange={handleEditing} />
				<label htmlFor="editing" className="with-padding flex alt-center with-gap" title="Edit">
					<span className="icon with-padding small-padding">Edit</span>
				</label>
				<a id="settings" href="../settings/" className="with-padding flex alt-center with-gap" title="Settings">
					<span className="icon with-padding small-padding">Settings</span>
				</a>
			</header>
			<main className="with-padding flex column with-block-gap">
				<ul id="notes" className="flex column with-block-gap">
					{notes.map(note => <NoteRow key={note.id} note={note} marked={selection.has(note.id)} onMark={handleMark} />)}
				</ul>
				<div className="float-section">
					<button id="open-add" type="button" className="layer with-padding large-padding flex alt-center with-gap" title="Add" onClick={() => setPanel(Panel.add)}>
						<span className="with-padding flex">
							<span className="icon with-padding small-padding">Add</span>
						</span>
					</button>
					<button id="open-actions" type="button" className="layer with-padding large-padding flex alt-center with-gap" title="Actions" onClick={() => setPanel(Panel.actions)}>
						<span className="with-padding flex">
							<span className="icon with-padding small-padding">Actions</span>
						</span>
					</button>
				</div>
			</main>
			<AddDialog library={library} open={panel === Panel.add} onClose={handleClose} onChange={handleChange} />
			<ActionsDialog library={library} selected={selected} open={panel === Panel.actions} onClose={handleClose} onChange={handleChange} />
		</>
	);
}
//#endregion
