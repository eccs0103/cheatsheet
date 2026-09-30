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

	return (
		<>
			<header className="layer rounded in-top">
				<a id="return" href="../library/" className="with-padding flex alt-center with-gap" title="Return">
					<span className="icon with-padding small-padding">Return</span>
				</a>
				<h3 id="title">{sheet.name}</h3>
			</header>
			<main className="with-padding flex column with-block-gap">
				{sheet.polls.map((poll, index) => <PollCard key={index} poll={poll} query={query} incorrect={settings.incorrect} />)}
			</main>
			<footer className="layer rounded in-bottom">
				<label className="with-padding flex">
					<input id="search" type="text" placeholder="Input for search" autoFocus value={text} onChange={(event) => setText(event.currentTarget.value)} />
				</label>
			</footer>
		</>
	);
}
//#endregion
