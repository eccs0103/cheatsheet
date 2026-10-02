"use strict";

import "adaptive-extender/web";
import { type ReactElement, useMemo, useState } from "react";
import { type Sheet } from "../../library/models/sheet.js";
import { type Settings } from "../../settings/models/settings.js";
import { Query } from "../services/query.js";
import { PollCard } from "./poll-card.js";

//#region Finder app
export interface FinderAppProps {
	sheet: Sheet;
	settings: Settings;
}

export function FinderApp({ sheet, settings }: FinderAppProps): ReactElement {
	const [text, setText] = useState<string>(String.empty);
	const query = useMemo(() => new Query(text, settings.sensitive, settings.skipping), [text, settings]);
	const { polls } = sheet;
	const matches = polls.map(poll => query.matches(poll.question));
	const count = matches.filter(match => match).length;

	return (
		<>
			<header className="layer rounded in-top">
				<a id="return" href="../library/" className="with-padding flex alt-center with-gap" title="Return">
					<span className="icon with-padding small-padding">Return</span>
				</a>
				<h3 id="title" data-placeholder="Untitled">{sheet.name}</h3>
				<span id="count" className="description with-inline-padding large-padding" title="Matching questions">{count} / {polls.length}</span>
			</header>
			<main className="with-padding flex column with-block-gap">
				<p className="description" hidden={count > 0}>No questions match this search.</p>
				{polls.map((poll, index) => <PollCard key={index} number={index + 1} poll={poll} query={query} incorrect={settings.incorrect} hidden={!matches[index]} />)}
			</main>
			<footer className="layer rounded in-bottom">
				<label className="with-padding flex alt-center with-gap">
					<span className="icon with-padding small-padding">Search</span>
					<input id="search" type="text" placeholder="Type part of a question" autoFocus value={text} onChange={(event) => setText(event.currentTarget.value)} />
				</label>
			</footer>
		</>
	);
}
//#endregion
