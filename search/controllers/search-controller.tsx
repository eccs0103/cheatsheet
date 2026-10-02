"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnalyticsController } from "../../environment/controllers/analytics-controller.js";
import { SettingsService } from "../../settings/services/settings-service.js";
import { LibraryService } from "../../library/services/library-service.js";
import { FinderApp } from "../view/finder-app.js";

const settings = SettingsService.instance;
const library = LibraryService.instance;
const { body } = document;

//#region Finder controller
class FinderController extends Controller {
	async run(): Promise<void> {
		void AnalyticsController.launch();
		const { content } = settings;
		content.apply();

		const id = new URLSearchParams(location.search).get("sheet");
		if (id === null) throw new ReferenceError("No sheet is chosen");
		const note = library.find(id);
		if (note === null) throw new ReferenceError("The chosen sheet no longer exists");
		const { sheet } = note;
		const { name } = sheet;

		if (name !== null) document.title = `${name} - Cheatsheet`;
		const divRoot = body.getElement(HTMLDivElement, "div#root");
		createRoot(divRoot).render(<StrictMode><FinderApp sheet={sheet} settings={content} /></StrictMode>);
	}

	async catch(error: Error): Promise<void> {
		window.alert(error.message);
		location.assign("../library/");
	}
}
//#endregion

await FinderController.launch();
