"use strict";

import "adaptive-extender/web";
import { type ChangeEvent, type ReactElement, useCallback, useReducer, useState } from "react";
import { type Question } from "../../library/models/question.js";
import { type Sheet } from "../../library/models/sheet.js";
import { type LibraryService } from "../../library/services/library-service.js";
import { QuestionBlock } from "./question-block.js";
import { InsertRow } from "./insert-row.js";
import { Keys } from "./keys.js";

//#region Editor app
export interface EditorAppProps {
	library: LibraryService;
	id: string | null;
	initial: Sheet;
}

export function EditorApp({ library, id, initial }: EditorAppProps): ReactElement {
	const size = 50;
	const [sheet] = useState<Sheet>(initial);
	const [keys] = useState<Keys>(() => new Keys());
	const [appended, setAppended] = useState<Question | null>(null);
	const [complete, setComplete] = useState<boolean>(() => sheet.complete);
	const [, refresh] = useReducer((version: number) => version + 1, 0);

	// Re-renders the editor only when the sheet becomes complete or incomplete
	const check = useCallback((): void => setComplete(sheet.complete), [sheet]);

	const retitle = (event: ChangeEvent<HTMLInputElement>): void => {
		sheet.title = event.currentTarget.value;
		refresh();
	};

	const append = (text: string): void => {
		setAppended(sheet.append(text));
		check();
		refresh();
	};

	const discard = useCallback((question: Question): void => {
		sheet.remove(question);
		check();
		refresh();
	}, [sheet, check]);

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

	const { questions } = sheet;
	const blocks: ReactElement[] = [];
	for (let start = 0; start < questions.length; start += size) {
		blocks.push(<QuestionBlock key={start} questions={questions} start={start} end={Math.min(start + size, questions.length)} keys={keys} appended={appended} onChange={check} onRemove={discard} />);
	}

	return (
		<>
			<header className="layer rounded in-top">
				<a id="return" href="../library/" className="with-padding flex alt-center with-gap" title="Return">
					<span className="icon with-padding small-padding">Return</span>
				</a>
				<label className="with-block-padding">
					<input id="title" type="text" placeholder="Input the title" className="depth rounded with-padding" value={sheet.title} onChange={retitle} />
				</label>
				<button id="save" type="button" className="highlight with-padding flex alt-center with-gap" title="Save" disabled={!complete} onClick={() => void save()}>
					<span className="icon with-padding small-padding">Save</span>
				</button>
			</header>
			<main className="with-padding flex column with-block-gap">
				<p className="description" hidden={questions.length > 0}>No questions yet. Type the first one below.</p>
				{blocks}
			</main>
			<footer className="layer rounded in-bottom with-padding">
				<InsertRow placeholder="Input the question" title="Add question" small={false} focused={false} onInsert={append} />
			</footer>
		</>
	);
}
//#endregion
