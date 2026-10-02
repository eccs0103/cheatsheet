"use strict";

import "adaptive-extender/web";
import { type ReactElement } from "react";
import { type Entry } from "../models/entry.js";

//#region Entry row
export interface EntryRowProps {
	entry: Entry;
	marked: boolean;
	onMark(id: string): void;
}

export function EntryRow({ entry, marked, onMark }: EntryRowProps): ReactElement {
	const { id, sheet, date } = entry;
	return (
		<li>
			<label className="entry layer rounded">
				<input type="checkbox" hidden checked={marked} onChange={() => onMark(id)} />
				<a className="sheet" role="button" href={entry.link}>
					<span className="sheet-icon with-padding">
						<span className="icon with-padding small-padding"></span>
					</span>
					<span className="sheet-title" data-placeholder="Untitled">{sheet.name}</span>
					<time className="sheet-date" dateTime={date.toISOString()}>{date.toLocaleString()}</time>
				</a>
			</label>
		</li>
	);
}
//#endregion
