"use strict";

import "adaptive-extender/web";
import { type ReactElement, useMemo, useState } from "react";
import { type Sheet } from "../../library/models/sheet.js";
import { type LibraryService } from "../../library/services/library-service.js";
import { FileDownload } from "../../library/view/file-download.js";
import { SheetDraft } from "../models/sheet-draft.js";
import { PollPreview } from "./poll-preview.js";

//#region Editor app
export interface EditorAppProps {
	library: LibraryService;
	id: string | null;
	initial: SheetDraft;
}

export function EditorApp({ library, id, initial }: EditorAppProps): ReactElement {
	const [title, setTitle] = useState<string>(initial.title);
	const [text, setText] = useState<string>(initial.text);
	const draft = useMemo(() => new SheetDraft(title, text), [title, text]);
	const { problem, sheet } = draft;
	const ready = sheet !== null && sheet.polls.length > 0;

	const handleDownload = (): void => {
		if (sheet === null) return;
		FileDownload.save([sheet.toFile()]);
	};

	const store = async (target: Sheet): Promise<void> => {
		if (id === null) {
			await library.insert(target);
			return;
		}
		await library.replace(id, target);
	};

	const handleSave = async (): Promise<void> => {
		if (sheet === null) return;
		try {
			await store(sheet);
			location.assign("../library/");
		} catch (reason) {
			window.alert(Error.from(reason).message);
		}
	};

	return (
		<>
			<header className="layer rounded in-top">
				<a id="return" href="../library/" className="with-padding flex alt-center with-gap" title="Return">
					<span className="icon with-padding small-padding">Return</span>
				</a>
				<input id="title" type="text" placeholder="Sheet title" className="with-padding" value={title} onChange={(event) => setTitle(event.currentTarget.value)} />
			</header>
			<main className="with-padding flex column with-block-gap">
				<textarea id="text" className="layer rounded with-padding" spellCheck={false} placeholder={"What is the capital of Armenia?\n1. Yerevan\n0. Gyumri\n\nWhich of these are prime numbers?\n1. 2\n1. 3\n0. 4"} value={text} onChange={(event) => setText(event.currentTarget.value)} />
				{problem !== null && <span id="problem" className="alert">{problem}</span>}
				{sheet !== null && sheet.polls.map((poll, index) => <PollPreview key={index} poll={poll} />)}
			</main>
			<footer className="layer rounded in-bottom">
				<button id="download" type="button" className="with-padding flex alt-center with-gap" disabled={!ready} onClick={handleDownload}>
					<span className="icon with-padding small-padding">Download</span>
					<span>Download JSON</span>
				</button>
				<button id="save" type="button" className="with-padding flex alt-center with-gap" disabled={!ready} onClick={handleSave}>
					<span className="icon with-padding small-padding">Save</span>
					<span>Save</span>
				</button>
			</footer>
		</>
	);
}
//#endregion
