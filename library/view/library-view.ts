"use strict";

import "adaptive-extender/web";
import { type Note } from "../models/note.js";

//#region Library view
export class LibraryView {
	#ulNotes: HTMLUListElement;

	constructor(ulNotes: HTMLUListElement) {
		this.#ulNotes = ulNotes;
	}

	static #newRow(note: Note): HTMLLIElement {
		const { sheet, date } = note;
		const liNote = document.createElement("li");
		const labelNote = liNote.appendChild(document.createElement("label"));
		labelNote.classList.add("note", "layer", "rounded", "with-padding", "flex", "alt-center", "with-gap");
		const inputMark = labelNote.appendChild(document.createElement("input"));
		inputMark.type = "checkbox";
		inputMark.value = note.id;
		const aSheet = labelNote.appendChild(document.createElement("a"));
		aSheet.classList.add("flex", "alt-center", "with-gap");
		aSheet.href = note.link;
		const spanIcon = aSheet.appendChild(document.createElement("span"));
		spanIcon.classList.add("icon", "sheet");
		const spanTitle = aSheet.appendChild(document.createElement("span"));
		spanTitle.classList.add("title");
		spanTitle.textContent = sheet.name;
		const timeDate = aSheet.appendChild(document.createElement("time"));
		timeDate.dateTime = date.toISOString();
		timeDate.textContent = date.toLocaleString();
		return liNote;
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
		this.#ulNotes.replaceChildren(...notes.map(note => LibraryView.#newRow(note)));
	}

	mark(checked: boolean): void {
		for (const inputMark of this.#marks) {
			inputMark.checked = checked;
		}
	}

	static download(file: File): void {
		const url = URL.createObjectURL(file);
		const aDownload = document.createElement("a");
		aDownload.href = url;
		aDownload.download = file.name;
		aDownload.click();
		URL.revokeObjectURL(url);
	}
}
//#endregion
