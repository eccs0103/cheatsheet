"use strict";

import "adaptive-extender/web";
import { type ChangeEvent, type ReactElement, useReducer, useState } from "react";
import { type Poll } from "../../library/models/poll.js";
import { type Sheet } from "../../library/models/sheet.js";
import { type LibraryService } from "../../library/services/library-service.js";
import { PollEditor } from "./poll-editor.js";
import { InsertRow } from "./insert-row.js";

//#region Editor app
export interface EditorAppProps {
	library: LibraryService;
	id: string | null;
	initial: Sheet;
}

export function EditorApp({ library, id, initial }: EditorAppProps): ReactElement {
	const [sheet] = useState<Sheet>(initial);
	const [, refresh] = useReducer((version: number) => version + 1, 0);

	const handleTitle = (event: ChangeEvent<HTMLInputElement>): void => {
		sheet.title = event.currentTarget.value;
		refresh();
	};

	const handleAppend = (question: string): void => {
		sheet.append(question);
		refresh();
	};

	const handleRemove = (poll: Poll): void => {
		sheet.remove(poll);
		refresh();
	};

	const store = async (): Promise<void> => {
		if (id === null) {
			await library.insert(sheet);
			return;
		}
		await library.replace(id, sheet);
	};

	const handleSave = async (): Promise<void> => {
		try {
			await store();
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
				<label className="with-padding">
					<input id="title" type="text" placeholder="Input the title" value={sheet.title} onChange={handleTitle} />
				</label>
				<button id="save" type="button" className="with-padding flex alt-center with-gap" title="Save" disabled={!sheet.complete} onClick={() => void handleSave()}>
					<span className="icon with-padding small-padding">Save</span>
				</button>
			</header>
			<main className="with-padding flex column with-block-gap">
				<div id="polls" className="layer rounded with-padding">
					{sheet.polls.map((poll, index) => <PollEditor key={index} index={index} poll={poll} onChange={refresh} onRemove={handleRemove} />)}
					<InsertRow placeholder="Input the question" title="Add question" small={false} onInsert={handleAppend} />
				</div>
			</main>
		</>
	);
}
//#endregion
