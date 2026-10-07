"use strict";

import "adaptive-extender/web";
import { type ChangeEvent, type KeyboardEvent, type ReactElement, type RefObject, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { type Sheet } from "../../library/models/sheet.js";
import { type Settings } from "../../settings/models/settings.js";
import { type Matches } from "../models/matches.js";
import { type Scanner } from "../services/scanner.js";
import { Highlighter } from "./highlighter.js";
import { QuestionCard } from "./question-card.js";

//#region Search app
export interface SearchAppProps {
	sheet: Sheet;
	settings: Settings;
	scanner: Scanner;
}

export function SearchApp({ sheet, settings, scanner }: SearchAppProps): ReactElement {
	const step = 50;
	const [text, setText] = useState<string>(String.empty);
	const [highlighter] = useState<Highlighter>(() => new Highlighter());
	const [mounted] = useState<Set<number>>(() => new Set());
	const [limit, setLimit] = useState<number>(step);
	const refMain: RefObject<HTMLElement | null> = useRef(null);
	const refSentinel: RefObject<HTMLDivElement | null> = useRef(null);
	const { questions } = sheet;
	const { incorrect } = settings;
	const [matches, setMatches] = useState<Matches>(() => scanner.matches);
	const [paged, setPaged] = useState<Matches>(matches);
	const cards = useMemo(() => questions.map((question, position) => <QuestionCard number={position + 1} question={question} incorrect={incorrect} />), [questions, incorrect]);

	if (paged !== matches) {
		setPaged(matches);
		setLimit(step);
	}

	useEffect(() => {
		const controller = new AbortController();
		scanner.addEventListener("change", event => setMatches(scanner.matches), { signal: controller.signal });
		return () => controller.abort();
	}, [scanner]);

	// Cards mount on first reveal and stay mounted; the rest of the list only toggles `hidden`
	const shown = new Set(matches.first(limit));
	for (const position of shown) {
		mounted.add(position);
	}
	const order = Array.from(mounted).sort((left, right) => left - right);

	useLayoutEffect(() => {
		const main = refMain.current;
		if (main === null) return;
		highlighter.paint(main, matches);
	}, [highlighter, matches, limit]);

	useEffect(() => {
		const sentinel = refSentinel.current;
		if (sentinel === null) return;
		if (limit >= matches.count) return;
		const observer = new IntersectionObserver((entries) => {
			if (!entries.some(entry => entry.isIntersecting)) return;
			setLimit(limit + step);
		}, { root: refMain.current, rootMargin: "100% 0px" });
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [limit, matches]);

	const type = (event: ChangeEvent<HTMLInputElement>): void => {
		const { value } = event.currentTarget;
		setText(value);
		scanner.scan(value);
	};

	const clear = (event: KeyboardEvent<HTMLInputElement>): void => {
		if (event.key !== "Escape") return;
		setText(String.empty);
		scanner.scan(String.empty);
	};

	return (
		<>
			<header className="layer rounded in-top">
				<a id="return" href="../library/" className="with-padding flex alt-center with-gap" title="Return">
					<span className="icon with-padding small-padding">Return</span>
				</a>
				<h3 id="title" data-placeholder="Untitled">{sheet.name}</h3>
				<span id="count" className="description with-inline-padding large-padding" title="Matching questions">{matches.count} / {questions.length}</span>
			</header>
			<main ref={refMain} className="with-padding flex column with-block-gap">
				<p className="description" hidden={matches.count > 0}>No questions match this search.</p>
				{order.map(position => <article key={position} data-index={position} className="question layer rounded with-padding" hidden={!shown.has(position)}>{cards[position]}</article>)}
				<div ref={refSentinel} className="sentinel"></div>
			</main>
			<footer className="layer rounded in-bottom">
				<label className="with-padding flex alt-center with-gap">
					<span className="icon with-padding small-padding">Search</span>
					<input id="search" type="text" placeholder="Type part of a question" autoFocus value={text} onChange={type} onKeyDown={clear} />
				</label>
			</footer>
		</>
	);
}
//#endregion
