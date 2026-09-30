"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnalyticsController } from "../../environment/controllers/analytics-controller.js";
import { SettingsService } from "../../settings/services/settings-service.js";
import { LibraryService } from "../../library/services/library-service.js";
import { SheetDraft } from "../models/sheet-draft.js";
import { EditorApp } from "../view/editor-app.js";

const settings = SettingsService.instance;
const library = LibraryService.instance;
const { body } = document;

//#region Editor controller
class EditorController extends Controller {
	async run(): Promise<void> {
		void AnalyticsController.launch();
		settings.content.apply();

		const id = new URLSearchParams(location.search).get("sheet");
		const initial = EditorController.#draft(id);
		const divRoot = body.getElement(HTMLDivElement, "div#root");
		createRoot(divRoot).render(<StrictMode><EditorApp library={library} id={id} initial={initial} /></StrictMode>);
	}

	static #draft(id: string | null): SheetDraft {
		if (id === null) return new SheetDraft(String.empty, String.empty);
		const note = library.find(id);
		if (note === null) throw new ReferenceError("The chosen sheet no longer exists");
		document.title = `${note.sheet.name} - Editor - Cheatsheet`;
		return SheetDraft.from(note.sheet);
	}

	async catch(error: Error): Promise<void> {
		window.alert(error.message);
		location.assign("../library/");
	}
}
//#endregion

await EditorController.launch();
