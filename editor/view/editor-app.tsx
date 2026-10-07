"use strict";

import "adaptive-extender/web";
import { type ChangeEvent, type ReactElement, type RefObject, startTransition, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { type Question } from "../../library/models/question.js";
import { type Sheet } from "../../library/models/sheet.js";
import { type LibraryService } from "../../library/services/library-service.js";
import { QuestionEditor } from "./question-editor.js";
import { InsertRow } from "./insert-row.js";
import { Keys } from "./keys.js";

//#region Editor app
export interface EditorAppProps {
	library: LibraryService;
	id: string | null;
	initial: Sheet;
}

export function EditorApp({ library, id, initial }: EditorAppProps): ReactElement {
	const step = 50;
	const [sheet] = useState<Sheet>(initial);
	const [keys] = useState<Keys>(() => new Keys());
	const [limit, setLimit] = useState<number>(step);
	const [added] = useState<Set<Question>>(() => new Set());
	const [appended, setAppended] = useState<Question | null>(null);
	const [complete, setComplete] = useState<boolean>(() => sheet.complete);
	const [, refresh] = useReducer((version: number) => version + 1, 0);
	const refMain: RefObject<HTMLElement | null> = useRef(null);
	const { questions } = sheet;

	// Re-renders the editor only when the sheet becomes complete or incomplete
	const check = useCallback((): void => setComplete(sheet.complete), [sheet]);

	const retitle = (event: ChangeEvent<HTMLInputElement>): void => {
		sheet.title = event.currentTarget.value;
		refresh();
	};

	// A question added before the whole sheet is loaded shows right after the loaded part
	const append = (text: string): void => {
		const question = sheet.append(text);
		added.add(question);
		setAppended(question);
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

	// Loads the next page when the last loaded question nears the screen, as a transition so React builds it in slices; added questions sit after it, so it is found by its place among the cards
	useEffect(() => {
		const main = refMain.current;
		if (main === null) return;
		if (limit >= questions.length) return;
		const article = main.getElements(HTMLElement, "article.question").item(limit - 1);
		if (article === null) return;
		const observer = new IntersectionObserver((entries) => {
			if (!entries.some(entry => entry.isIntersecting)) return;
			startTransition(() => setLimit(limit + step));
		}, { root: main, rootMargin: "100% 0px" });
		observer.observe(article);
		return () => observer.disconnect();
	}, [limit, questions.length]);

	const editors: ReactElement[] = [];
	for (const [index, question] of questions.entries()) {
		if (index >= limit && !added.has(question)) continue;
		editors.push(<QuestionEditor key={keys.of(question)} number={index + 1} question={question} keys={keys} focused={question === appended} onChange={check} onRemove={discard} />);
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
			<main ref={refMain} className="with-padding flex column with-block-gap">
				<p className="description" hidden={questions.length > 0}>No questions yet. Type the first one below.</p>
				{editors}
			</main>
			<footer className="layer rounded in-bottom with-padding">
				<InsertRow placeholder="Input the question" title="Add question" small={false} focused={false} onInsert={append} />
			</footer>
		</>
	);
}
//#endregion
