"use strict";

import "adaptive-extender/web";
import { type ChangeEvent, type MouseEvent, type ReactElement, type SubmitEvent, useState } from "react";
import { type LibraryService } from "../services/library-service.js";
import { useModal } from "./use-modal.js";

//#region Add dialog
export interface AddDialogProps {
	library: LibraryService;
	open: boolean;
	onClose(): void;
	onChange(): void;
}

export function AddDialog({ library, open, onClose, onChange }: AddDialogProps): ReactElement {
	const [url, setUrl] = useState<string>(String.empty);
	const refDialog = useModal(open);

	const dismiss = (event: MouseEvent<HTMLDialogElement>): void => {
		if (event.target !== event.currentTarget) return;
		onClose();
	};

	const upload = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
		const inputFiles = event.currentTarget;
		const { files } = inputFiles;
		if (files === null) return;
		try {
			await library.add(Array.from(files));
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
			const address = new URL(url);
			const response = await fetch(address);
			if (!response.ok) throw new ReferenceError(`Unable to download the sheet: ${response.status} ${response.statusText}`);
			await library.add([new File([await response.blob()], address.href)]);
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
			<div className="flex column with-inline-padding large-padding">
				<section className="option">
					<h4 className="title">From device</h4>
					<span className="definition description">Choose one or more .json or .txt sheet files.</span>
					<input id="files" type="file" accept=".json,.txt,application/json,text/plain" multiple hidden onChange={(event) => void upload(event)} />
					<label htmlFor="files" role="button" className="value rounded depth with-padding flex alt-center with-gap">
						<span id="device" className="icon in-line">Upload</span>
						<span>Upload</span>
					</label>
				</section>
				<section className="option">
					<h4 className="title">From a link</h4>
					<span className="definition description">Paste the address of a sheet file.</span>
					<form id="link" className="grid-line flex alt-center with-gap" onSubmit={(event) => void pull(event)}>
						<input name="url" type="url" placeholder="https://" className="depth rounded with-padding" value={url} onChange={(event) => setUrl(event.currentTarget.value)} />
						<button type="submit" className="rounded depth with-padding flex alt-center with-gap" disabled={String.isWhitespace(url)}>
							<span id="cloud" className="icon in-line">Import</span>
							<span>Import</span>
						</button>
					</form>
				</section>
				<section className="option">
					<h4 className="title">From scratch</h4>
					<span className="definition description">Write a new sheet in the editor.</span>
					<a id="write" href="../editor/" role="button" className="value rounded depth with-padding flex alt-center with-gap">
						<span className="icon in-line">Write</span>
						<span>Write</span>
					</a>
				</section>
			</div>
		</dialog>
	);
}
//#endregion
