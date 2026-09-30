"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { AnalyticsController } from "../../environment/controllers/analytics-controller.js";
import { SettingsService } from "../../settings/services/settings-service.js";
import { LibraryService } from "../services/library-service.js";
import { LibraryView } from "../view/library-view.js";

const settings = SettingsService.instance;
const library = LibraryService.instance;
const { body } = document;

//#region Library controller
class LibraryController extends Controller {
	#view: LibraryView;
	#inputSelectAll: HTMLInputElement;
	#inputEditing: HTMLInputElement;

	async run(): Promise<void> {
		void AnalyticsController.launch();
		settings.content.apply();

		const ulNotes = body.getElement(HTMLUListElement, "ul#notes");
		const dialogAdd = body.getElement(HTMLDialogElement, "dialog#add");
		const dialogActions = body.getElement(HTMLDialogElement, "dialog#actions");
		this.#view = new LibraryView(ulNotes);
		this.#inputSelectAll = body.getElement(HTMLInputElement, "input#select-all");
		this.#inputEditing = body.getElement(HTMLInputElement, "input#editing");

		this.#render();
		this.#wireSelection(ulNotes);
		this.#wireDialog(body.getElement(HTMLButtonElement, "button#open-add"), dialogAdd);
		this.#wireDialog(body.getElement(HTMLButtonElement, "button#open-actions"), dialogActions);
		this.#wireUpload(dialogAdd);
		this.#wireLink(dialogAdd);
		this.#wireActions(dialogActions);
	}

	#render(): void {
		const { notes } = library;
		this.#view.render(notes);
		this.#inputSelectAll.checked = false;
		if (notes.length > 0) return;
		this.#inputEditing.checked = false;
	}

	#wireSelection(ulNotes: HTMLUListElement): void {
		const view = this.#view;
		const inputSelectAll = this.#inputSelectAll;
		this.#inputEditing.addEventListener("change", () => {
			view.mark(false);
			inputSelectAll.checked = false;
		});
		inputSelectAll.addEventListener("change", () => {
			view.mark(inputSelectAll.checked);
		});
		ulNotes.addEventListener("change", () => {
			inputSelectAll.checked = view.complete;
		});
	}

	#wireDialog(buttonOpen: HTMLButtonElement, dialog: HTMLDialogElement): void {
		buttonOpen.addEventListener("click", () => dialog.showModal());
		dialog.addEventListener("click", (event) => {
			if (event.target !== dialog) return;
			dialog.close();
		});
	}

	#wireUpload(dialogAdd: HTMLDialogElement): void {
		const inputFiles = dialogAdd.getElement(HTMLInputElement, "input#files");
		inputFiles.addEventListener("change", async () => {
			try {
				const { files } = inputFiles;
				if (files === null) return;
				for (const file of files) {
					await library.add(await file.text());
				}
				dialogAdd.close();
			} catch (reason) {
				window.alert(Error.from(reason).message);
			} finally {
				inputFiles.value = "";
				this.#render();
			}
		});
	}

	#wireLink(dialogAdd: HTMLDialogElement): void {
		const formLink = dialogAdd.getElement(HTMLFormElement, "form#link");
		const inputUrl = formLink.getElement(HTMLInputElement, "input[name=\"url\"]");
		formLink.addEventListener("submit", async (event) => {
			event.preventDefault();
			try {
				const response = await fetch(new URL(inputUrl.value));
				if (!response.ok) throw new ReferenceError(`Unable to download the sheet: ${response.status} ${response.statusText}`);
				await library.add(await response.text());
				formLink.reset();
				dialogAdd.close();
			} catch (reason) {
				window.alert(Error.from(reason).message);
			} finally {
				this.#render();
			}
		});
	}

	#wireActions(dialogActions: HTMLDialogElement): void {
		const view = this.#view;
		const buttonDownload = dialogActions.getElement(HTMLButtonElement, "button#download");
		const buttonShare = dialogActions.getElement(HTMLButtonElement, "button#share");
		const buttonDelete = dialogActions.getElement(HTMLButtonElement, "button#delete");

		buttonDownload.addEventListener("click", () => {
			view.download(this.#selected());
			dialogActions.close();
		});
		buttonShare.addEventListener("click", async () => {
			try {
				await this.#share(this.#selected());
				dialogActions.close();
			} catch (reason) {
				const error = Error.from(reason);
				if (error.name === "AbortError") return;
				window.alert(error.message);
			}
		});
		buttonDelete.addEventListener("click", async () => {
			const { selection } = view;
			if (!window.confirm(`Delete ${selection.size} sheet(s)?`)) return;
			await library.remove(selection);
			this.#render();
			dialogActions.close();
		});
	}

	#selected(): File[] {
		const { selection } = this.#view;
		return library.notes.filter(note => selection.has(note.id)).map(note => note.sheet.toFile());
	}

	async #share(files: File[]): Promise<void> {
		const url = new URL("../library/", location.href);
		await navigator.share({ files, text: `Sharing ${files.length} sheet(s) with you. Open them in ${url}.`, url: url.href });
	}

	async catch(error: Error): Promise<void> {
		window.alert(error.message);
	}
}
//#endregion

await LibraryController.launch();
