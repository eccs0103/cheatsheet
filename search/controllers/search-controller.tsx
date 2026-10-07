"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnalyticsController } from "../../environment/controllers/analytics-controller.js";
import { SettingsService } from "../../settings/services/settings-service.js";
import { LibraryService } from "../../library/services/library-service.js";
import { Scanner } from "../services/scanner.js";
import { SearchApp } from "../view/search-app.js";

const settings = SettingsService.instance;
const { body } = document;

//#region Search controller
class SearchController extends Controller {
	async run(): Promise<void> {
		void AnalyticsController.launch();
		const { content } = settings;
		content.apply();

		const id = new URLSearchParams(location.search).get("sheet");
		if (id === null) throw new ReferenceError("No sheet is chosen");
		const library = await LibraryService.open();
		const entry = await library.find(id);
		if (entry === null) throw new ReferenceError("The chosen sheet no longer exists");
		const { sheet } = entry;
		const { name } = sheet;

		if (name !== null) document.title = `${name} - Cheatsheet`;
		const scanner = new Scanner(sheet.questions, content);
		const divRoot = body.getElement(HTMLDivElement, "div#root");
		createRoot(divRoot).render(<StrictMode><SearchApp sheet={sheet} settings={content} scanner={scanner} /></StrictMode>);
	}

	async catch(error: Error): Promise<void> {
		window.alert(error.message);
		location.assign("../library/");
	}
}
//#endregion

await SearchController.launch();
