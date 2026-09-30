"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { AnalyticsController } from "../../environment/controllers/analytics-controller.js";
import { SettingsService } from "../../settings/services/settings-service.js";
import { LibraryService } from "../../library/services/library-service.js";
import { Query } from "../services/query.js";
import { FinderView } from "../view/finder-view.js";

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

		const h3Title = body.getElement(HTMLHeadingElement, "h3#title");
		const main = body.getElement(HTMLElement, "main");
		const inputSearch = body.getElement(HTMLInputElement, "input#search");

		h3Title.textContent = sheet.name;
		document.title = `${sheet.name} - Cheatsheet`;
		const view = new FinderView(main, sheet.polls, content.incorrect);
		const filter = (): void => view.filter(new Query(inputSearch.value, content.sensitive, content.skipping));
		filter();
		inputSearch.addEventListener("input", filter);
	}

	async catch(error: Error): Promise<void> {
		window.alert(error.message);
		location.assign("../library/");
	}
}
//#endregion

await FinderController.launch();
