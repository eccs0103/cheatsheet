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
	async run(): Promise<void> {
		void AnalyticsController.launch();
		settings.content.apply();

		const inputSelectAll = body.getElement(HTMLInputElement, "input#select-all");
		const inputEditing = body.getElement(HTMLInputElement, "input#editing");
		const ulNotes = body.getElement(HTMLUListElement, "ul#notes");
		const buttonOpenAdd = body.getElement(HTMLButtonElement, "button#open-add");
		const buttonOpenActions = body.getElement(HTMLButtonElement, "button#open-actions");
		const dialogAdd = body.getElement(HTMLDialogElement, "dialog#add");
		const inputFiles = dialogAdd.getElement(HTMLInputElement, "input#files");
		const formLink = dialogAdd.getElement(HTMLFormElement, "form#link");
		const inputUrl = formLink.getElement(HTMLInputElement, "input[name=\"url\"]");
		const dialogActions = body.getElement(HTMLDialogElement, "dialog#actions");
		const buttonDownload = dialogActions.getElement(HTMLButtonElement, "button#download");
		const buttonShare = dialogActions.getElement(HTMLButtonElement, "button#share");
		const buttonDelete = dialogActions.getElement(HTMLButtonElement, "button#delete");

		const view = new LibraryView(ulNotes);
		const render = (): void => {
			view.render(library.notes);
			inputSelectAll.checked = false;
			if (library.notes.length > 0) return;
			inputEditing.checked = false;
		};
		render();

		inputEditing.addEventListener("change", () => {
			view.mark(false);
			inputSelectAll.checked = false;
		});
		inputSelectAll.addEventListener("change", () => view.mark(inputSelectAll.checked));
		ulNotes.addEventListener("change", () => inputSelectAll.checked = view.complete);

		for (const dialog of [dialogAdd, dialogActions]) {
			dialog.addEventListener("click", (event) => {
				if (event.target !== dialog) return;
				dialog.close();
			});
		}
		buttonOpenAdd.addEventListener("click", () => dialogAdd.showModal());
		buttonOpenActions.addEventListener("click", () => dialogActions.showModal());

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
				render();
			}
		});

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
				render();
			}
		});

		const selected = (): File[] => {
			const selection = view.selection;
			return library.notes.filter(note => selection.has(note.id)).map(note => note.sheet.toFile());
		};

		buttonDownload.addEventListener("click", () => {
			for (const file of selected()) {
				LibraryView.download(file);
			}
			dialogActions.close();
		});

		buttonShare.addEventListener("click", async () => {
			const files = selected();
			const url = new URL("../library/", location.href);
			try {
				await navigator.share({ files, text: `Sharing ${files.length} sheet(s) with you. Open them in ${url}.`, url: url.href });
				dialogActions.close();
			} catch (reason) {
				const error = Error.from(reason);
				if (error.name === "AbortError") return;
				window.alert(error.message);
			}
		});

		buttonDelete.addEventListener("click", async () => {
			const selection = view.selection;
			if (!window.confirm(`Delete ${selection.size} sheet(s)?`)) return;
			await library.remove(selection);
			render();
			dialogActions.close();
		});
	}

	async catch(error: Error): Promise<void> {
		window.alert(error.message);
	}
}
//#endregion

await LibraryController.launch();
