"use strict";

import "adaptive-extender/web";
import { Controller } from "adaptive-extender/web";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnalyticsController } from "../../environment/controllers/analytics-controller.js";
import { SettingsService } from "../services/settings-service.js";
import { SettingsApp } from "../view/settings-app.js";

const settings = SettingsService.instance;
const { body } = document;

//#region Settings controller
class SettingsController extends Controller {
	async run(): Promise<void> {
		void AnalyticsController.launch();
		settings.content.apply();

		const divRoot = body.getElement(HTMLDivElement, "div#root");
		createRoot(divRoot).render(<StrictMode><SettingsApp settings={settings} /></StrictMode>);
	}

	async catch(error: Error): Promise<void> {
		window.alert(error.message);
	}
}
//#endregion

await SettingsController.launch();
