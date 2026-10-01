"use strict";

import "adaptive-extender/web";
import { type ReactElement } from "react";
import { type Note } from "../models/note.js";
import { type LibraryService } from "../services/library-service.js";
import { FileDownload } from "./file-download.js";
import { ModalDialog } from "./modal-dialog.js";

//#region Actions dialog
export interface ActionsDialogProps {
	library: LibraryService;
	selected: readonly Note[];
	open: boolean;
	onClose(): void;
	onChange(): void;
}

export function ActionsDialog({ library, selected, open, onClose, onChange }: ActionsDialogProps): ReactElement {
	const files = (): File[] => selected.map(note => note.sheet.toFile());

	const handleEdit = (): void => {
		const [note] = selected;
		location.assign(note.editor);
	};

	const handleDownload = (): void => {
		FileDownload.save(files());
		onClose();
	};

	const handleShare = async (): Promise<void> => {
		const url = new URL("../library/", location.href);
		const shared = files();
		try {
			await navigator.share({ files: shared, text: `Sharing ${shared.length} sheet(s) with you. Open them in ${url}.`, url: url.href });
			onClose();
		} catch (reason) {
			const error = Error.from(reason);
			if (error.name === "AbortError") return;
			window.alert(error.message);
		}
	};

	const handleDelete = async (): Promise<void> => {
		if (!window.confirm(`Delete ${selected.length} sheet(s)?`)) return;
		try {
			await library.remove(new Set(selected.map(note => note.id)));
			onClose();
		} catch (reason) {
			window.alert(Error.from(reason).message);
		} finally {
			onChange();
		}
	};

	return (
		<ModalDialog id="actions" open={open} onClose={onClose}>
			<h3 className="highlight">Actions</h3>
			<button id="edit" type="button" className="flex alt-center with-gap" disabled={selected.length !== 1} onClick={handleEdit}>
				<span className="with-padding flex">
					<span className="icon with-padding small-padding">Edit</span>
				</span>
				<span>Edit selection</span>
			</button>
			<button id="download" type="button" className="flex alt-center with-gap" disabled={selected.length === 0} onClick={handleDownload}>
				<span className="with-padding flex">
					<span className="icon with-padding small-padding">Download</span>
				</span>
				<span>Download selection</span>
			</button>
			<button id="share" type="button" className="flex alt-center with-gap" disabled={selected.length === 0} onClick={() => void handleShare()}>
				<span className="with-padding flex">
					<span className="icon with-padding small-padding">Share</span>
				</span>
				<span>Share selection</span>
			</button>
			<button id="delete" type="button" className="alert flex alt-center with-gap" disabled={selected.length === 0} onClick={() => void handleDelete()}>
				<span className="with-padding flex">
					<span className="icon with-padding small-padding">Delete</span>
				</span>
				<span>Delete selection</span>
			</button>
		</ModalDialog>
	);
}
//#endregion
