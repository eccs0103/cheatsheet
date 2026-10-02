"use strict";

import "adaptive-extender/web";
import { type ReactElement } from "react";
import { type Entry } from "../models/entry.js";
import { type LibraryService } from "../services/library-service.js";
import { FileDownload } from "./file-download.js";

//#region Actions bar
export interface ActionsBarProps {
	library: LibraryService;
	selected: readonly Entry[];
	onAdd(): void;
	onChange(): void;
}

export function ActionsBar({ library, selected, onAdd, onChange }: ActionsBarProps): ReactElement {
	const files = (): File[] => selected.map(entry => entry.sheet.toFile());
	const probe = new File(["{}"], "sheet.json", { type: "application/json" });
	const supported = "canShare" in navigator && navigator.canShare({ files: [probe] });

	const edit = (): void => {
		const [entry] = selected;
		location.assign(entry.editor);
	};

	const download = (): void => {
		FileDownload.save(files());
	};

	const share = async (): Promise<void> => {
		const shared = files();
		const url = new URL("../library/", location.href);
		try {
			await navigator.share({ files: shared, text: `Sharing ${shared.length} sheet(s) with you. Add them in ${url}.`, url: url.href });
		} catch (reason) {
			const error = Error.from(reason);
			if (error.name === "AbortError") return;
			if (error.name === "NotAllowedError") {
				window.alert("Your browser claims it can share .json files but refuses to. Download the sheets and send them yourself.");
				return;
			}
			window.alert(error.message);
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
			<button id="share" type="button" className="with-padding flex column center" title="Share selection" disabled={selected.length === 0 || !supported} onClick={() => void share()}>
				<span className="icon with-padding small-padding">Share</span>
				<span className="font-smaller-3">Share</span>
			</button>
			<button id="delete" type="button" className="alert with-padding flex column center" title="Delete selection" disabled={selected.length === 0} onClick={() => void remove()}>
				<span className="icon with-padding small-padding">Delete</span>
				<span className="font-smaller-3">Delete</span>
			</button>
			<p id="share-hint" className="description with-padding" hidden={supported}>Your browser can't share .json files. Download the sheets and send them yourself.</p>
		</footer>
	);
}
//#endregion
