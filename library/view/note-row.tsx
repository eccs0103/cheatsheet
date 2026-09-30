"use strict";

import "adaptive-extender/web";
import { type ReactElement } from "react";
import { type Note } from "../models/note.js";

//#region Note row
export interface NoteRowProps {
	note: Note;
	marked: boolean;
	onMark(id: string): void;
}

export function NoteRow({ note, marked, onMark }: NoteRowProps): ReactElement {
	const { id, sheet, date } = note;
	return (
		<li>
			<label className="note layer rounded">
				<input type="checkbox" hidden checked={marked} onChange={() => onMark(id)} />
				<a className="sheet" role="button" href={note.link}>
					<span className="sheet-icon with-padding">
						<span className="icon with-padding small-padding"></span>
					</span>
					<span className="sheet-title">{sheet.name}</span>
					<time className="sheet-date" dateTime={date.toISOString()}>{date.toLocaleString()}</time>
				</a>
			</label>
		</li>
	);
}
//#endregion
