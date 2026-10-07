"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnalyticsController } from "../../environment/controllers/analytics-controller.js";
import { SettingsService } from "../../settings/services/settings-service.js";
import { LibraryService } from "../services/library-service.js";
import { LibraryApp } from "../view/library-app.js";

const settings = SettingsService.instance;
const { body } = document;

//#region Library controller
class LibraryController extends Controller {
	async run(): Promise<void> {
		void AnalyticsController.launch();
		settings.content.apply();

		const library = await LibraryService.open();
		const source = new URLSearchParams(location.search).get("import");
		if (source !== null) {
			try {
				const entry = await library.pull(new URL(source));
				location.replace(entry.link);
				return;
			} catch (reason) {
				window.alert(Error.from(reason).message);
			}
		}
		await library.reconcile();
		const divRoot = body.getElement(HTMLDivElement, "div#root");
		createRoot(divRoot).render(<StrictMode><LibraryApp library={library} initial={library.list()} /></StrictMode>);
	}

	async catch(error: Error): Promise<void> {
		window.alert(error.message);
	}
}
//#endregion

await LibraryController.launch();
