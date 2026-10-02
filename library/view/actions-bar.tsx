"use strict";

import "adaptive-extender/web";
import { type ReactElement, useState } from "react";
import { type Entry } from "../models/entry.js";
import { type LibraryService } from "../services/library-service.js";
import { FileDownload } from "./file-download.js";
import { ShareDialog } from "./share-dialog.js";

//#region Actions bar
export interface ActionsBarProps {
	library: LibraryService;
	selected: readonly Entry[];
	onAdd(): void;
	onChange(): void;
}

export function ActionsBar({ library, selected, onAdd, onChange }: ActionsBarProps): ReactElement {
	const [fallback, setFallback] = useState<boolean>(false);
	const files = (): File[] => selected.map(entry => entry.sheet.toFile());

	const edit = (): void => {
		const [entry] = selected;
		location.assign(entry.editor);
	};

	const download = (): void => {
		FileDownload.save(files());
	};

	const send = async (shared: File[]): Promise<void> => {
		const url = new URL("../library/", location.href);
		await navigator.share({ files: shared, text: `Sharing ${shared.length} sheet(s) with you. Add them in ${url}.`, url: url.href });
	};

	const report = (reason: unknown): void => {
		const error = Error.from(reason);
		if (error.name === "AbortError") return;
		window.alert(error.message);
	};

	const share = async (): Promise<void> => {
		const shared = files();
		try {
			if (!navigator.canShare({ files: shared })) throw new DOMException("Unable to share .json files", "NotAllowedError");
			await send(shared);
		} catch (reason) {
			if (!(reason instanceof DOMException) || reason.name !== "NotAllowedError") {
				report(reason);
				return;
			}
			setFallback(true);
		}
	};

	const convert = async (): Promise<void> => {
		setFallback(false);
		try {
			await send(selected.map(entry => entry.sheet.toPlainFile()));
		} catch (reason) {
			report(reason);
		}
	};

	const remove = async (): Promise<void> => {
		if (!window.confirm(`Delete ${selected.length} sheet(s)?`)) return;
		try {
			await library.remove(new Set(selected.map(entry => entry.id)));
		} catch (reason) {
			window.alert(Error.from(reason).message);
		} finally {
			onChange();
		}
	};

	return (
		<>
			<footer className="layer rounded in-bottom">
				<button id="open-add" type="button" className="with-padding flex column center" title="Add sheet" onClick={onAdd}>
					<span className="icon with-padding small-padding">Add</span>
					<span className="font-smaller-3">Add sheet</span>
				</button>
				<button id="edit" type="button" className="with-padding flex column center" title="Edit selection" disabled={selected.length !== 1} onClick={edit}>
					<span className="icon with-padding small-padding">Edit</span>
					<span className="font-smaller-3">Edit</span>
				</button>
				<button id="download" type="button" className="with-padding flex column center" title="Download selection" disabled={selected.length === 0} onClick={download}>
					<span className="icon with-padding small-padding">Download</span>
					<span className="font-smaller-3">Download</span>
				</button>
				<button id="share" type="button" className="with-padding flex column center" title="Share selection" disabled={selected.length === 0 || !("canShare" in navigator)} onClick={() => void share()}>
					<span className="icon with-padding small-padding">Share</span>
					<span className="font-smaller-3">Share</span>
				</button>
				<button id="delete" type="button" className="alert with-padding flex column center" title="Delete selection" disabled={selected.length === 0} onClick={() => void remove()}>
					<span className="icon with-padding small-padding">Delete</span>
					<span className="font-smaller-3">Delete</span>
				</button>
			</footer>
			<ShareDialog open={fallback} onConfirm={() => void convert()} onClose={() => setFallback(false)} />
		</>
	);
}
//#endregion
