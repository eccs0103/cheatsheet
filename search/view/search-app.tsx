"use strict";

import "adaptive-extender/web";
import { type KeyboardEvent, type ReactElement, type RefObject, useDeferredValue, useLayoutEffect, useMemo, useRef, useState } from "react";
import { type Sheet } from "../../library/models/sheet.js";
import { type Settings } from "../../settings/models/settings.js";
import { Folding } from "../services/folding.js";
import { Query } from "../services/query.js";
import { Highlighter } from "./highlighter.js";
import { QuestionCard } from "./question-card.js";

//#region Search app
export interface SearchAppProps {
	sheet: Sheet;
	settings: Settings;
}

export function SearchApp({ sheet, settings }: SearchAppProps): ReactElement {
	const [text, setText] = useState<string>(String.empty);
	const [highlighter] = useState<Highlighter>(() => new Highlighter());
	const refMain: RefObject<HTMLElement | null> = useRef(null);
	const deferred = useDeferredValue(text);
	const { questions } = sheet;
	const { sensitive, accents, matching, tolerant, incorrect } = settings;

	const folding = useMemo(() => new Folding(sensitive, accents), [sensitive, accents]);
	const index = useMemo(() => questions.map(question => folding.tokenize(question.text)), [questions, folding]);
	const cards = useMemo(() => questions.map((question, position) => <QuestionCard number={position + 1} question={question} incorrect={incorrect} />), [questions, incorrect]);
	const results = useMemo(() => {
		const query = new Query(deferred, folding, matching, tolerant);
		return index.map(tokens => query.test(tokens));
	}, [deferred, folding, matching, tolerant, index]);
	const count = results.filter(result => result !== null).length;

	useLayoutEffect(() => {
		const main = refMain.current;
		if (main === null) return;
		highlighter.paint(main, results);
	}, [highlighter, results]);

	const clear = (event: KeyboardEvent<HTMLInputElement>): void => {
		if (event.key !== "Escape") return;
		setText(String.empty);
	};

	return (
		<>
			<header className="layer rounded in-top">
				<a id="return" href="../library/" className="with-padding flex alt-center with-gap" title="Return">
					<span className="icon with-padding small-padding">Return</span>
				</a>
				<h3 id="title" data-placeholder="Untitled">{sheet.name}</h3>
				<span id="count" className="description with-inline-padding large-padding" title="Matching questions">{count} / {questions.length}</span>
			</header>
			<main ref={refMain} className="with-padding flex column with-block-gap">
				<p className="description" hidden={count > 0}>No questions match this search.</p>
				{cards.map((card, position) => <article key={position} className="question layer rounded with-padding" hidden={results[position] === null}>{card}</article>)}
			</main>
			<footer className="layer rounded in-bottom">
				<label className="with-padding flex alt-center with-gap">
					<span className="icon with-padding small-padding">Search</span>
					<input id="search" type="text" placeholder="Type part of a question" autoFocus value={text} onChange={(event) => setText(event.currentTarget.value)} onKeyDown={clear} />
				</label>
			</footer>
		</>
	);
}
//#endregion
