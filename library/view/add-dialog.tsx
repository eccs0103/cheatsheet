"use strict";

import "adaptive-extender/web";
import { type ChangeEvent, type MouseEvent, type ReactElement, type RefObject, type SubmitEvent, useEffect, useRef, useState } from "react";
import { type LibraryService } from "../services/library-service.js";

//#region Add dialog
export interface AddDialogProps {
	library: LibraryService;
	open: boolean;
	onClose(): void;
	onChange(): void;
}

export function AddDialog({ library, open, onClose, onChange }: AddDialogProps): ReactElement {
	const [url, setUrl] = useState<string>(String.empty);
	const refDialog: RefObject<HTMLDialogElement | null> = useRef(null);

	useEffect(() => {
		const dialog = refDialog.current;
		if (dialog === null) return;
		if (dialog.open === open) return;
		if (open) {
			dialog.showModal();
			return;
		}
		dialog.close();
	}, [open]);

	const dismiss = (event: MouseEvent<HTMLDialogElement>): void => {
		if (event.target !== event.currentTarget) return;
		onClose();
	};

	const upload = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
		const inputFiles = event.currentTarget;
		const { files } = inputFiles;
		try {
			if (files === null) return;
			for (const file of files) {
				await library.add(await file.text());
			}
			onClose();
		} catch (reason) {
			window.alert(Error.from(reason).message);
		} finally {
			inputFiles.value = String.empty;
			onChange();
		}
	};

	const pull = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
		event.preventDefault();
		try {
			const response = await fetch(new URL(url));
			if (!response.ok) throw new ReferenceError(`Unable to download the sheet: ${response.status} ${response.statusText}`);
			await library.add(await response.text());
			setUrl(String.empty);
			onClose();
		} catch (reason) {
			window.alert(Error.from(reason).message);
		} finally {
			onChange();
		}
	};

	return (
		<dialog id="add" ref={refDialog} className="layer rounded flex column" onClick={dismiss} onClose={onClose}>
			<div className="layer with-padding large-padding flex alt-center with-gap">
				<h3>Add sheet</h3>
				<button id="close-add" type="button" className="flex alt-center" title="Close (Esc)" onClick={onClose}>
					<span className="icon with-padding small-padding">Close</span>
				</button>
			</div>
			<div className="flex column with-gap with-inline-padding large-padding">
				<input id="files" type="file" accept=".json,application/json" multiple hidden onChange={(event) => void upload(event)} />
				<label htmlFor="files" role="button" className="depth rounded with-padding flex alt-center with-gap">
					<span id="device" className="icon with-padding small-padding">Upload</span>
					<span>Upload from device</span>
				</label>
				<form id="link" className="depth rounded with-padding flex alt-center with-gap" onSubmit={(event) => void pull(event)}>
					<span id="cloud" className="icon with-padding small-padding">Link</span>
					<input name="url" type="url" placeholder="Paste a link to a sheet" className="layer rounded with-padding" value={url} onChange={(event) => setUrl(event.currentTarget.value)} />
					<button type="submit" className="with-padding" disabled={String.isWhitespace(url)}>Import</button>
				</form>
				<a id="write" href="../editor/" role="button" className="depth rounded with-padding flex alt-center with-gap">
					<span className="icon with-padding small-padding">Write</span>
					<span>Write in editor</span>
				</a>
			</div>
		</dialog>
	);
}
//#endregion
