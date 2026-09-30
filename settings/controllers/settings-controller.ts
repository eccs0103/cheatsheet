"use strict";

import "adaptive-extender/web";
import { Controller, Enum } from "adaptive-extender/web";
import { AnalyticsController } from "../../environment/controllers/analytics-controller.js";
import { Scheme } from "../models/settings.js";
import { SettingsService } from "../services/settings-service.js";

const settings = SettingsService.instance;
const { body } = document;

//#region Settings controller
class SettingsController extends Controller {
	async run(): Promise<void> {
		void AnalyticsController.launch();

		const selectScheme = body.getElement(HTMLSelectElement, "select#scheme");
		const inputIncorrect = body.getElement(HTMLInputElement, "input#incorrect");
		const inputSensitive = body.getElement(HTMLInputElement, "input#sensitive");
		const inputSkipping = body.getElement(HTMLInputElement, "input#skipping");
		const buttonReset = body.getElement(HTMLButtonElement, "button#reset");

		const render = (): void => {
			const { content } = settings;
			content.apply();
			selectScheme.value = content.scheme;
			inputIncorrect.checked = content.incorrect;
			inputSensitive.checked = content.sensitive;
			inputSkipping.checked = content.skipping;
		};
		render();

		selectScheme.addEventListener("change", async () => {
			const { content } = settings;
			content.scheme = Enum.Of(Scheme).import(selectScheme.value, "scheme");
			content.apply();
			await settings.save();
		});
		inputIncorrect.addEventListener("change", async () => {
			settings.content.incorrect = inputIncorrect.checked;
			await settings.save();
		});
		inputSensitive.addEventListener("change", async () => {
			settings.content.sensitive = inputSensitive.checked;
			await settings.save();
		});
		inputSkipping.addEventListener("change", async () => {
			settings.content.skipping = inputSkipping.checked;
			await settings.save();
		});
		buttonReset.addEventListener("click", () => {
			if (!window.confirm("The settings will be reset to their defaults. Are you sure?")) return;
			settings.reset();
			render();
		});
	}

	async catch(error: Error): Promise<void> {
		window.alert(error.message);
	}
}
//#endregion

await SettingsController.launch();
