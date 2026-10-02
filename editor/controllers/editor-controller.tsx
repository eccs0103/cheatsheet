"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnalyticsController } from "../../environment/controllers/analytics-controller.js";
import { SettingsService } from "../../settings/services/settings-service.js";
import { LibraryService } from "../../library/services/library-service.js";
import { Sheet } from "../../library/models/sheet.js";
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
		const initial = EditorController.#sheet(id);
		const divRoot = body.getElement(HTMLDivElement, "div#root");
		createRoot(divRoot).render(<StrictMode><EditorApp library={library} id={id} initial={initial} /></StrictMode>);
	}

	static #sheet(id: string | null): Sheet {
		if (id === null) return new Sheet(String.empty, []);
		const entry = library.find(id);
		if (entry === null) throw new ReferenceError("The chosen sheet no longer exists");
		const { sheet } = entry;
		const { name } = sheet;
		if (name !== null) document.title = `${name} - Editor - Cheatsheet`;
		return sheet.clone();
	}

	async catch(error: Error): Promise<void> {
		window.alert(error.message);
		location.assign("../library/");
	}
}
//#endregion

await EditorController.launch();
