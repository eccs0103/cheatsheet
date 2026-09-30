"use strict";

import "adaptive-extender/web";
import { type Note } from "../models/note.js";
import { DOMBuilder } from "./dom-builder.js";

//#region Library view
export class LibraryView {
	#ulNotes: HTMLUListElement;

	constructor(ulNotes: HTMLUListElement) {
		this.#ulNotes = ulNotes;
	}

	static #newNote(parent: Element, note: Note): void {
		const { sheet } = note;
		const labelRow = DOMBuilder.newRow(parent);
		DOMBuilder.newCheckbox(labelRow, note.id);
		const aSheet = DOMBuilder.newLink(labelRow, note.link);
		DOMBuilder.newIcon(aSheet, "sheet");
		DOMBuilder.newTitle(aSheet, sheet.name);
		DOMBuilder.newTime(aSheet, note.date);
	}

	get #marks(): HTMLInputElement[] {
		return Array.from(this.#ulNotes.getElements(HTMLInputElement, "input[type=\"checkbox\"]"));
	}

	get selection(): Set<string> {
		return new Set(this.#marks.filter(inputMark => inputMark.checked).map(inputMark => inputMark.value));
	}

	get complete(): boolean {
		const marks = this.#marks;
		return marks.length > 0 && marks.every(inputMark => inputMark.checked);
	}

	render(notes: readonly Note[]): void {
		const ulNotes = this.#ulNotes;
		ulNotes.replaceChildren();
		for (const note of notes) {
			LibraryView.#newNote(ulNotes, note);
		}
	}

	mark(checked: boolean): void {
		for (const inputMark of this.#marks) {
			inputMark.checked = checked;
		}
	}

	download(files: readonly File[]): void {
		for (const file of files) {
			DOMBuilder.newDownload(file);
		}
	}
}
//#endregion
