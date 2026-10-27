"use strict";

import "adaptive-extender/web";
import { type ChangeEvent, type ReactElement, type RefObject, startTransition, useCallback, useInsertionEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { type Question } from "../../library/models/question.js";
import { type Sheet } from "../../library/models/sheet.js";
import { type LibraryService } from "../../library/services/library-service.js";
import { Completion } from "./completion.js";
import { QuestionEditor } from "./question-editor.js";
import { InsertRow } from "./insert-row.js";
import { Keys } from "./keys.js";
import { Range, Viewport } from "./viewport.js";

//#region Editor app
export interface EditorAppProps {
	library: LibraryService;
	id: string | null;
	initial: Sheet;
}

export function EditorApp({ library, id, initial }: EditorAppProps): ReactElement {
	const [sheet] = useState<Sheet>(initial);
	const [completion] = useState<Completion>(() => new Completion(sheet));
	const [keys] = useState<Keys>(() => new Keys());
	const [viewport] = useState<Viewport>(() => new Viewport());
	const [range, setRange] = useState<Range>(Range.empty);
	const [appended, setAppended] = useState<Question | null>(null);
	const [complete, setComplete] = useState<boolean>(() => completion.complete);
	const [, refresh] = useReducer((version: number) => version + 1, 0);
	const refMain: RefObject<HTMLElement | null> = useRef(null);
	const refQuestions: RefObject<HTMLDivElement | null> = useRef(null);
	const refCards: RefObject<HTMLDivElement | null> = useRef(null);
	const { questions } = sheet;

	const check = useCallback((question: Question): void => {
		completion.revise(question);
		setComplete(completion.complete);
	}, [completion]);

	const retitle = (event: ChangeEvent<HTMLInputElement>): void => {
		sheet.title = event.currentTarget.value;
		refresh();
	};

	const append = (text: string): void => {
		const question = sheet.append(text);
		setAppended(question);
		check(question);
		refresh();
	};

	const discard = useCallback((question: Question): void => {
		sheet.remove(question);
		completion.forget(question);
		setComplete(completion.complete);
		refresh();
	}, [sheet, completion]);

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

	const locate = useCallback((): void => {
		const main = refMain.current;
		const divQuestions = refQuestions.current;
		const divCards = refCards.current;
		if (main === null || divQuestions === null || divCards === null) return;
		const top = main.getBoundingClientRect().top - divQuestions.getBoundingClientRect().top;
		const next = viewport.range(divCards, sheet.questions, top, main.clientHeight);
		setRange(previous => previous.equals(next) ? previous : next);
	}, [viewport, sheet]);

	const follow = useCallback((): void => startTransition(locate), [locate]);

	useLayoutEffect(() => {
		const main = refMain.current;
		if (main === null) return;
		const controller = new AbortController();
		viewport.addEventListener("change", follow, { signal: controller.signal });
		const observer = new ResizeObserver(follow);
		observer.observe(main);
		return () => {
			controller.abort();
			observer.disconnect();
		};
	}, [viewport, follow]);

	useLayoutEffect(() => locate(), [locate, questions.length]);

	// Set before any layout effect, so a question that takes the focus on mount already sits at its final place
	useInsertionEffect(() => {
		const divQuestions = refQuestions.current;
		if (divQuestions === null) return;
		range.place(divQuestions);
	}, [range]);

	useLayoutEffect(() => {
		const main = refMain.current;
		if (main === null || appended === null) return;
		main.scrollTo({ top: main.scrollHeight, behavior: "instant" });
	}, [appended]);

	const { start } = range;
	const editors = questions.slice(start, range.end).map((question, offset) => <QuestionEditor key={keys.of(question)} number={start + offset + 1} question={question} keys={keys} viewport={viewport} focused={question === appended} onChange={check} onRemove={discard} />);

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
			<main ref={refMain} className="with-padding flex column with-block-gap" onScroll={follow}>
				<p className="description" hidden={questions.length > 0}>No questions yet. Type the first one below.</p>
				<div ref={refQuestions} className="questions">
					<div className="before"></div>
					<div ref={refCards} className="cards flex column with-block-gap">{editors}</div>
					<div className="after"></div>
				</div>
			</main>
			<footer className="layer rounded in-bottom with-padding">
				<InsertRow placeholder="Input the question" title="Add question" small={false} focused={false} onInsert={append} />
			</footer>
		</>
	);
}
//#endregion
