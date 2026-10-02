"use strict";

import "adaptive-extender/web";
import { type ReactElement } from "react";
import { type Note } from "../models/note.js";
import { type LibraryService } from "../services/library-service.js";
import { FileDownload } from "./file-download.js";

//#region Actions bar
export interface ActionsBarProps {
	library: LibraryService;
	editing: boolean;
	selected: readonly Note[];
	onAdd(): void;
	onChange(): void;
}

export function ActionsBar({ library, editing, selected, onAdd, onChange }: ActionsBarProps): ReactElement {
	const files = (): File[] => selected.map(note => note.sheet.toFile());

	const edit = (): void => {
		const [note] = selected;
		location.assign(note.editor);
	};

	const download = (): void => {
		FileDownload.save(files());
	};

	const share = async (): Promise<void> => {
		const url = new URL("../library/", location.href);
		const shared = files();
		try {
			await navigator.share({ files: shared, text: `Sharing ${shared.length} sheet(s) with you. Open them in ${url}.`, url: url.href });
		} catch (reason) {
			const error = Error.from(reason);
			if (error.name === "AbortError") return;
			window.alert(error.message);
		}
	};

	const remove = async (): Promise<void> => {
		if (!window.confirm(`Delete ${selected.length} sheet(s)?`)) return;
		try {
			await library.remove(new Set(selected.map(note => note.id)));
		} catch (reason) {
			window.alert(Error.from(reason).message);
		} finally {
			onChange();
		}
	};

	if (!editing) return (
		<footer className="layer rounded in-bottom">
			<button id="open-add" type="button" className="with-padding large-padding flex center with-gap" onClick={onAdd}>
				<span className="icon with-padding small-padding">Add</span>
				<span>Add sheet</span>
			</button>
		</footer>
	);

	return (
		<footer className="layer rounded in-bottom">
			<button id="edit" type="button" className="with-padding flex column center" title="Edit selection" disabled={selected.length !== 1} onClick={edit}>
				<span className="icon with-padding small-padding">Edit</span>
				<span className="font-smaller-3">Edit</span>
			</button>
			<button id="download" type="button" className="with-padding flex column center" title="Download selection" disabled={selected.length === 0} onClick={download}>
				<span className="icon with-padding small-padding">Download</span>
				<span className="font-smaller-3">Download</span>
			</button>
			<button id="share" type="button" className="with-padding flex column center" title="Share selection" disabled={selected.length === 0} onClick={() => void share()}>
				<span className="icon with-padding small-padding">Share</span>
				<span className="font-smaller-3">Share</span>
			</button>
			<button id="delete" type="button" className="alert with-padding flex column center" title="Delete selection" disabled={selected.length === 0} onClick={() => void remove()}>
				<span className="icon with-padding small-padding">Delete</span>
				<span className="font-smaller-3">Delete</span>
			</button>
		</footer>
	);
}
//#endregion
