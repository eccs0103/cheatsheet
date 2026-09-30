"use strict";

import "adaptive-extender/web";
import { type ChangeEvent, type FormEvent, type ReactElement, useState } from "react";
import { type LibraryService } from "../services/library-service.js";
import { ModalDialog } from "./modal-dialog.js";

//#region Add dialog
export interface AddDialogProps {
	library: LibraryService;
	open: boolean;
	onClose(): void;
	onChange(): void;
}

export function AddDialog({ library, open, onClose, onChange }: AddDialogProps): ReactElement {
	const [url, setUrl] = useState<string>(String.empty);

	const handleFiles = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
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

	const handleLink = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
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
		<ModalDialog id="add" open={open} onClose={onClose}>
			<h3 className="highlight">Add sheet</h3>
			<input id="files" type="file" accept=".json,application/json" multiple hidden onChange={handleFiles} />
			<label htmlFor="files" role="button" className="flex alt-center with-gap">
				<span className="with-padding flex">
					<span id="device" className="icon with-padding small-padding">Upload</span>
				</span>
				<span>Upload from device</span>
			</label>
			<form id="link" className="flex alt-center with-gap" onSubmit={handleLink}>
				<span className="with-padding flex">
					<span id="cloud" className="icon with-padding small-padding">Cloud</span>
				</span>
				<input name="url" type="url" placeholder="Import from cloud" className="depth rounded with-padding" value={url} onChange={(event) => setUrl(event.currentTarget.value)} />
				<button type="submit" className="highlight">Import</button>
			</form>
			<a id="write" href="../editor/" role="button" className="flex alt-center with-gap">
				<span className="with-padding flex">
					<span className="icon with-padding small-padding">Write</span>
				</span>
				<span>Write in editor</span>
			</a>
		</ModalDialog>
	);
}
//#endregion
