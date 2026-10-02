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
	const [appended, setAppended] = useState<boolean>(false);
	const [, refresh] = useReducer((version: number) => version + 1, 0);

	const retitle = (event: ChangeEvent<HTMLInputElement>): void => {
		sheet.title = event.currentTarget.value;
		refresh();
	};

	const append = (question: string): void => {
		sheet.append(question);
		setAppended(true);
		refresh();
	};

	const discard = (poll: Poll): void => {
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

	const save = async (): Promise<void> => {
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
				<label className="with-block-padding">
					<input id="title" type="text" placeholder="Input the title" className="depth rounded with-padding" value={sheet.title} onChange={retitle} />
				</label>
				<button id="save" type="button" className="highlight with-padding flex alt-center with-gap" title="Save" disabled={!sheet.complete} onClick={() => void save()}>
					<span className="icon with-padding small-padding">Save</span>
				</button>
			</header>
			<main className="with-padding flex column with-block-gap">
				<p className="description" hidden={sheet.polls.length > 0}>No questions yet. Type the first one below.</p>
				{sheet.polls.map((poll, index) => <PollEditor key={index} index={index} poll={poll} focused={appended} onChange={refresh} onRemove={discard} />)}
			</main>
			<footer className="layer rounded in-bottom with-padding">
				<InsertRow placeholder="Input the question" title="Add question" small={false} focused={false} onInsert={append} />
			</footer>
		</>
	);
}
//#endregion
